from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Any, List
import logging
import io
import httpx
from PIL import Image
from datetime import datetime, timedelta

# Import config first to load .env file
from app import config

# Initialize Firebase
from app.config.firebase_config import FirebaseConfig

from app.orchestrator.agent import PipOrchestrator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import sentry_sdk
from app.config.settings import SENTRY_DSN
from contextlib import asynccontextmanager

if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize Firebase Admin SDK on application startup."""
    try:
        FirebaseConfig.initialize()
        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        raise RuntimeError(f"Failed to initialize Firebase on startup.") from e
    yield

app = FastAPI(title="Pip System API", version="0.2.0", lifespan=lifespan)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

from app.config.settings import ENV

# CORS configuration
ALLOWED_ORIGINS = [
    "https://edu-explorer-9827f.web.app",
    "https://edu-explorer-9827f.firebaseapp.com",
]

if ENV == "development":
    ALLOWED_ORIGINS.extend([
        "http://localhost:5173",
        "http://localhost:3000",
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "Accept", "Origin"],
)

# Initialize Orchestrator
orchestrator = PipOrchestrator()

# Import route modules
from app.routes.user_routes import router as user_router
from app.repositories.discovery_repository import DiscoveryRepository
from app.repositories.user_repository import UserRepository
from app.models.discovery_record import DiscoveryRecord
from app.auth.firebase_auth import verify_firebase_token, optional_auth, get_user_id
import uuid
from datetime import datetime
import base64
from firebase_admin import storage

# Register routers
app.include_router(user_router)

# Initialize repositories
discovery_repo = DiscoveryRepository()
user_repo = UserRepository()

class DiscoveryInput(BaseModel):
    child_id: Optional[str] = None
    child_name: Optional[str] = "Explorer"
    child_age: Optional[int] = 7
    discovery_description: Optional[str] = ""
    location_tag: Optional[str] = "backyard"
    media_type: str = "image"
    media_data: Optional[str] = None  # Legacy, keeping optional for backwards compatibility
    image_url: Optional[str] = None

    timestamp: Optional[str] = None
    location: Optional[dict] = None  # {"lat": ..., "lng": ...}

@app.get("/")
async def root():
    return {"message": "Pip System API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/discovery")
async def process_discovery(
    discovery: DiscoveryInput,
    save: bool = True,
    token: dict = Depends(optional_auth)
):
    """
    Endpoint for frontend to send discoveries to the Pip System.
    Works with or without authentication.
    If save=True (default) and authenticated, saves to Firestore.
    If save=False, only returns analysis (for live mode).
    """
    try:
        # Convert Pydantic model to dict
        input_data = discovery.model_dump()
        
        if not discovery.image_url and not discovery.media_data:
            raise HTTPException(status_code=422, detail="Either image_url or media_data must be provided.")
            
        # 1. SECURITY CRITICAL: Pre-validate Image BEFORE hitting AI Orchestrator
        if discovery.image_url:
            # Prevent SSRF: Ensure URL belongs to Firebase Storage
            allowed_prefixes = [
                "https://firebasestorage.googleapis.com/v0/b/edu-explorer-9827f.appspot.com/o/",
                "https://firebasestorage.googleapis.com/v0/b/edu-explorer-9827f.firebasestorage.app/o/"
            ]
            if not any(discovery.image_url.startswith(prefix) for prefix in allowed_prefixes):
                logger.error(f"SSRF attempt or invalid image URL domain: {discovery.image_url}")
                raise HTTPException(status_code=400, detail="Image URL must be a valid Firebase Storage URL.")
                
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(discovery.image_url)
                    resp.raise_for_status()

                    # Strict file size validation (5MB max)
                    if len(resp.content) > 5 * 1024 * 1024:
                        raise HTTPException(status_code=400, detail="Image file too large (max 5MB).")

                    img = Image.open(io.BytesIO(resp.content))
                    if img.format not in ["JPEG", "PNG", "WEBP", "MPO"]:
                        raise HTTPException(status_code=400, detail=f"Invalid image type: {img.format}")
                    img.verify() # Verify it is a valid image format
                    logger.info(f"Successfully pre-validated image {discovery.image_url}")
            except HTTPException:
                raise
            except Exception as img_err:
                logger.error(f"Invalid or corrupted image at {discovery.image_url}: {img_err}")
                raise HTTPException(status_code=400, detail="Invalid image file provided.")
        elif discovery.media_type == "image" and discovery.media_data:
            try:
                header, encoded = discovery.media_data.split(",", 1) if "," in discovery.media_data else ("", discovery.media_data)
                image_bytes = base64.b64decode(encoded)

                # Strict file size validation (5MB max)
                if len(image_bytes) > 5 * 1024 * 1024:
                    raise HTTPException(status_code=400, detail="Image file too large (max 5MB).")

                img = Image.open(io.BytesIO(image_bytes))
                if img.format not in ["JPEG", "PNG", "WEBP", "MPO"]:
                    raise HTTPException(status_code=400, detail=f"Invalid image type: {img.format}")
                img.verify()
            except HTTPException:
                raise
            except Exception as img_err:
                logger.error(f"Failed to pre-validate legacy base64 image: {img_err}")
                raise HTTPException(status_code=400, detail="Invalid image or base64 data.")

        # 2. Process via Orchestrator
        orchestrator_response = await orchestrator.process_discovery(input_data)
        
        # 3. If user is authenticated AND save is requested, save to Firestore
        if token and save:
            try:
                user_id = get_user_id(token)
                
                # Update user's last active timestamp
                await user_repo.update_last_active(user_id)
                
                # Create discovery record
                discovery_id = f"disc_{uuid.uuid4().hex}"
                
                image_url = None
                
                # Use provided image_url or execute legacy base64 upload
                if discovery.image_url:
                    image_url = discovery.image_url

                elif discovery.media_type == "image" and discovery.media_data:
                    # Legacy fallback logic if frontend hasn't updated yet
                    try:
                        header, encoded = discovery.media_data.split(",", 1) if "," in discovery.media_data else ("", discovery.media_data)
                        image_bytes = base64.b64decode(encoded)

                        bucket = storage.bucket()
                        blob = bucket.blob(f"discoveries/{user_id}/{discovery_id}.jpg")
                        # Run blocking SDK call in executor to avoid stalling the event loop
                        loop = asyncio.get_event_loop()
                        await loop.run_in_executor(
                            None,
                            lambda: blob.upload_from_string(image_bytes, content_type="image/jpeg"),
                        )
                        image_url = blob.public_url
                        logger.info(f"Successfully uploaded legacy base64 image for discovery {discovery_id}")
                    except Exception as upload_error:
                        logger.error(f"Failed to process legacy base64 image: {upload_error}")
                        raise ValueError("Invalid image or base64 data.")

                discovery_record = DiscoveryRecord(
                    discovery_id=discovery_id,
                    user_id=user_id,
                    child_id=discovery.child_id,
                    timestamp=datetime.utcnow(),
                    image_url=image_url,
                    location=discovery.location,
                    subject_type=orchestrator_response.get("subject_type", "unknown"),
                    species_info=orchestrator_response.get("species_info", {}),
                    safety_assessment=orchestrator_response.get("safety", {}),
                    story=orchestrator_response.get("story", ""),
                    learning_activities=orchestrator_response.get("activities", []),
                    viewed_at=datetime.utcnow()
                )
                
                # Save to Firestore
                saved_id = await discovery_repo.save_discovery(discovery_record)
                logger.info(f"Saved discovery {saved_id} for user {user_id}")
                
                # Add discovery_id to response
                orchestrator_response["discovery_id"] = saved_id
                orchestrator_response["saved"] = True
                
            except Exception as save_error:
                logger.error(f"Failed to save discovery: {str(save_error)}")
                orchestrator_response["saved"] = False
                orchestrator_response["save_error"] = str(save_error)
        else:
            orchestrator_response["saved"] = False
            if not token:
                orchestrator_response["info"] = "Sign in to save discoveries"
            elif not save:
                orchestrator_response["info"] = "Live mode - analysis only"
        
        return orchestrator_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Discovery processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="An internal server error occurred while processing the discovery.")


@app.get("/api/discoveries")
async def get_discoveries(
    child_id: Optional[str] = None,
    limit: int = 50,
    page: int = 1,
    token: dict = Depends(verify_firebase_token)
):
    """Get user's discovery history."""
    user_id = get_user_id(token)
    
    discoveries = await discovery_repo.get_user_discoveries(
        user_id=user_id,
        limit=limit,
        child_id=child_id,
        page=page
    )
    
    total = await discovery_repo.count_user_discoveries(user_id)
    
    return {
        "discoveries": [d.model_dump() for d in discoveries],
        "total": total,
        "page": page,
        "page_size": limit
    }


@app.get("/api/discoveries/recent")
async def get_recent_discoveries(
    days: int = 7,
    token: dict = Depends(verify_firebase_token)
):
    """Get discoveries from the last N days."""
    user_id = get_user_id(token)
    
    discoveries = await discovery_repo.get_recent_discoveries(user_id, days)
    
    return {
        "discoveries": [d.model_dump() for d in discoveries],
        "days": days
    }


@app.get("/api/discoveries/favorites")
async def get_favorite_discoveries(token: dict = Depends(verify_firebase_token)):
    """Get user's favorite discoveries."""
    user_id = get_user_id(token)
    
    discoveries = await discovery_repo.get_favorites(user_id)
    
    return {
        "favorites": [d.model_dump() for d in discoveries]
    }


@app.post("/api/discoveries/{discovery_id}/favorite")
async def toggle_favorite(
    discovery_id: str,
    favorite: bool = True,
    token: dict = Depends(verify_firebase_token)
):
    """Mark or unmark a discovery as favorite."""
    await discovery_repo.mark_favorite(discovery_id, favorite)
    
    return {"success": True, "discovery_id": discovery_id, "favorite": favorite}


# --------------------------------------------------------------------------- #
#  CHAT ENDPOINT                                                                #
# --------------------------------------------------------------------------- #

class ChatInput(BaseModel):
    message: str
    child_name: Optional[str] = "Explorer"
    child_age: Optional[int] = 7
    discoveries: Optional[List[str]] = []

@app.post("/api/chat")
async def chat_with_pip(
    body: ChatInput,
    token: dict = Depends(optional_auth)
):
    """
    Chat with Pip the AI companion.
    Returns a friendly, age-appropriate AI-generated response.
    """
    from app.utils.gemini_client import get_gemini_client

    try:
        client = get_gemini_client()

        discovery_context = ""
        if body.discoveries:
            discovery_list = ", ".join(body.discoveries[-5:])  # last 5
            discovery_context = f"\nThe child has previously discovered: {discovery_list}."

        system_instruction = (
            f"You are Pip, a magical, enthusiastic AI nature companion for a "
            f"{body.child_age}-year-old child named {body.child_name}. "
            f"You love helping kids explore nature and learn about the world. "
            f"Keep replies SHORT (2–3 sentences max), fun, and age-appropriate. "
            f"Use emojis sparingly but warmly. Never mention that you are an AI."
            f"{discovery_context}"
        )

        reply = await client.generate_async(
            prompt=body.message,
            system_instruction=system_instruction,
            temperature=0.9
        )

        return {"reply": reply}

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Chat service unavailable")


# --------------------------------------------------------------------------- #
#  USER STATS ENDPOINT                                                          #
# --------------------------------------------------------------------------- #

@app.get("/api/users/stats")
async def get_user_stats(token: dict = Depends(optional_auth)):
    """
    Returns discovery statistics for the Live Discovery screen:
      - discoveries_today: count of discoveries made today
      - new_species: unique species discovered this week
      - streak_days: consecutive days with at least one discovery
    """
    if not token:
        # Return zeroed stats for unauthenticated users
        return {"discoveries_today": 0, "new_species": 0, "streak_days": 0}

    try:
        user_id = get_user_id(token)
        today = datetime.utcnow().date()

        # Discoveries in last 7 days for streak/species calculation
        recent = await discovery_repo.get_recent_discoveries(user_id, days=30)

        # Count today's discoveries
        discoveries_today = sum(
            1 for d in recent
            if d.timestamp and d.timestamp.date() == today
        )

        # Count unique species this week
        week_ago = today - timedelta(days=7)
        seen_species = set()
        for d in recent:
            if d.timestamp and d.timestamp.date() >= week_ago:
                name = ""
                if d.species_info:
                    name = d.species_info.get("common_name", "")
                if name:
                    seen_species.add(name.lower())
        new_species = len(seen_species)

        # Calculate streak: consecutive days with >= 1 discovery
        days_with_discoveries = set(
            d.timestamp.date() for d in recent if d.timestamp
        )
        streak = 0
        check_date = today
        while check_date in days_with_discoveries:
            streak += 1
            check_date -= timedelta(days=1)

        return {
            "discoveries_today": discoveries_today,
            "new_species": new_species,
            "streak_days": streak
        }

    except Exception as e:
        logger.error(f"Stats error: {e}")
        return {"discoveries_today": 0, "new_species": 0, "streak_days": 0}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
