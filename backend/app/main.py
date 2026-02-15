from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Any
from app.orchestrator.agent import PipOrchestrator

app = FastAPI(title="Pip System API", version="0.1.0")

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

class DiscoveryInput(BaseModel):
    child_id: str
    child_name: Optional[str] = "Explorer"
    child_age: Optional[int] = 7
    discovery_description: Optional[str] = ""
    location_tag: Optional[str] = "backyard"
    media_type: str = "image"
    media_data: str # Base64 string
    timestamp: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Pip System API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/discovery")
async def process_discovery(discovery: DiscoveryInput):
    """
    Endpoint for frontend to send discoveries to the Pip System.
    """
    try:
        # Convert Pydantic model to dict
        input_data = discovery.model_dump()
        
        # Process via Orchestrator
        response = await orchestrator.process_discovery(input_data)
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
