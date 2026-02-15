from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Any
import logging

# Import config first to load .env file
from app import config

# Initialize Firebase
from app.config.firebase_config import FirebaseConfig

from app.orchestrator.agent import PipOrchestrator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pip System API", version="0.2.0")

# Initialize Firebase on startup
@app.on_event("startup")
async def startup_event():
    """Initialize Firebase Admin SDK on application startup."""
    try:
        FirebaseConfig.initialize()
        logger.info("Firebase Admin SDK initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        # Continue running - Firebase will initialize on first use

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    media_data: str  # Base64 string
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
    token: dict = Depends(optional_auth)
):
    """
    Endpoint for frontend to send discoveries to the Pip System.
    Works with or without authentication - saves to Firestore only if authenticated.
    """
    try:
        # Convert Pydantic model to dict
        input_data = discovery.model_dump()
        
        # Process via Orchestrator
        orchestrator_response = await orchestrator.process_discovery(input_data)
        
        # If user is authenticated, save to Firestore
        if token:
            try:
                user_id = get_user_id(token)
                
                # Update user's last active timestamp
                await user_repo.update_last_active(user_id)
                
                # Create discovery record
                discovery_id = f"disc_{uuid.uuid4().hex}"
                discovery_record = DiscoveryRecord(
                    discovery_id=discovery_id,
                    user_id=user_id,
                    child_id=discovery.child_id,
                    timestamp=datetime.utcnow(),
                    image_url=None,  # TODO: Upload to Firebase Storage
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
            orchestrator_response["info"] = "Sign in to save discoveries"
        
        return orchestrator_response
        
    except Exception as e:
        logger.error(f"Discovery processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
