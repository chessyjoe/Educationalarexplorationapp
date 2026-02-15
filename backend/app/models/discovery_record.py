"""
Discovery Record Data Models
Defines Pydantic models for storing and retrieving discovery records.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class DiscoveryRecord(BaseModel):
    """
    Complete record of a discovery event with AI analysis results.
    """
    discovery_id: str = Field(..., description="Unique discovery identifier")
    user_id: str = Field(..., description="Firebase UID of the user")
    child_id: Optional[str] = Field(None, description="Child ID if discovery was for a specific child")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="When the discovery was made")
    
    # Captured data
    image_url: Optional[str] = Field(None, description="Firebase Storage URL for the captured image")
    location: Optional[Dict[str, float]] = Field(
        None, 
        description="Geographic location {'lat': ..., 'lng': ...}"
    )
    
    # AI Analysis results
    subject_type: str = Field(..., description="Type of subject: plant, insect, animal, etc.")
    species_info: Dict[str, Any] = Field(..., description="Species information from specialist agent")
    safety_assessment: Dict[str, Any] = Field(..., description="Safety evaluation from safety agent")
    story: str = Field(..., description="Educational story from storyteller agent")
    learning_activities: List[Dict[str, Any]] = Field(..., description="Activities from educator agent")
    
    # Engagement metrics
    viewed_at: datetime = Field(default_factory=datetime.utcnow, description="When first viewed")
    time_spent_seconds: Optional[int] = Field(None, description="Time user spent on this discovery")
    activities_completed: List[str] = Field(
        default_factory=list, 
        description="IDs of completed activities"
    )
    favorite: bool = Field(default=False, description="Whether user marked as favorite")
    
    def to_firestore(self) -> dict:
        """
        Convert to Firestore document format.
        Excludes discovery_id as it's the document ID.
        
        Returns:
            Dict suitable for Firestore document
        """
        return {
            "user_id": self.user_id,
            "child_id": self.child_id,
            "timestamp": self.timestamp,
            "image_url": self.image_url,
            "location": self.location,
            "subject_type": self.subject_type,
            "species_info": self.species_info,
            "safety_assessment": self.safety_assessment,
            "story": self.story,
            "learning_activities": self.learning_activities,
            "viewed_at": self.viewed_at,
            "time_spent_seconds": self.time_spent_seconds,
            "activities_completed": self.activities_completed,
            "favorite": self.favorite
        }
    
    @classmethod
    def from_firestore(cls, discovery_id: str, data: dict) -> "DiscoveryRecord":
        """
        Create DiscoveryRecord from Firestore document.
        
        Args:
            discovery_id: Document ID
            data: Firestore document data
            
        Returns:
            DiscoveryRecord instance
        """
        return cls(
            discovery_id=discovery_id,
            user_id=data["user_id"],
            child_id=data.get("child_id"),
            timestamp=data.get("timestamp", datetime.utcnow()),
            image_url=data.get("image_url"),
            location=data.get("location"),
            subject_type=data["subject_type"],
            species_info=data["species_info"],
            safety_assessment=data["safety_assessment"],
            story=data["story"],
            learning_activities=data["learning_activities"],
            viewed_at=data.get("viewed_at", datetime.utcnow()),
            time_spent_seconds=data.get("time_spent_seconds"),
            activities_completed=data.get("activities_completed", []),
            favorite=data.get("favorite", False)
        )
    
    class Config:
        json_schema_extra = {
            "example": {
                "discovery_id": "disc_abc123",
                "user_id": "user_xyz789",
                "child_id": "child_1",
                "timestamp": "2026-02-15T10:30:00Z",
                "subject_type": "butterfly",
                "species_info": {
                    "common_name": "Monarch Butterfly",
                    "scientific_name": "Danaus plexippus",
                    "habitat": "meadows and gardens",
                    "interesting_facts": ["Migrates thousands of miles"]
                },
                "safety_assessment": {
                    "safe_to_touch": False,
                    "warnings": ["Handle gently, do not disturb"],
                    "safety_level": "safe"
                },
                "story": "Once upon a time...",
                "learning_activities": [
                    {
                        "title": "Draw the butterfly",
                        "description": "Color the butterfly's wings"
                    }
                ]
            }
        }


class CreateDiscoveryRequest(BaseModel):
    """Request model for creating a new discovery."""
    child_id: Optional[str] = None
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    location: Optional[Dict[str, float]] = None
    raw_input: str = Field(..., description="User's input about what they found")


class DiscoveryListResponse(BaseModel):
    """Response model for listing discoveries."""
    discoveries: List[DiscoveryRecord]
    total: int
    page: int = 1
    page_size: int = 50
