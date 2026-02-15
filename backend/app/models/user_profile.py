"""
User Profile Data Models
Defines Pydantic models for user profiles and child profiles.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration."""
    PARENT = "parent"
    CHILD = "child"
    EDUCATOR = "educator"


class ChildProfile(BaseModel):
    """
    Child profile within a parent's account.
    """
    child_id: str = Field(..., description="Unique identifier for the child")
    name: str = Field(..., description="Child's first name")
    age: int = Field(..., ge=3, le=12, description="Child's age (3-12 years)")
    interests: List[str] = Field(default_factory=list, description="Child's interests (e.g., 'insects', 'plants')")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    learning_level: str = Field(default="beginner", description="Learning level: beginner, intermediate, advanced")
    avatar_color: Optional[str] = Field(None, description="Avatar color for UI personalization")
    
    class Config:
        json_schema_extra = {
            "example": {
                "child_id": "child_abc123",
                "name": "Emma",
                "age": 7,
                "interests": ["butterflies", "flowers", "birds"],
                "learning_level": "beginner",
                "avatar_color": "#FF6B9D"
            }
        }


class UserProfile(BaseModel):
    """
    Complete user profile including authentication and child profiles.
    """
    user_id: str = Field(..., description="Firebase UID")
    email: EmailStr = Field(..., description="User's email address")
    display_name: Optional[str] = Field(None, description="User's display name")
    role: UserRole = Field(default=UserRole.PARENT, description="User role")
    children: List[ChildProfile] = Field(default_factory=list, description="Child profiles")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    preferences: dict = Field(default_factory=dict, description="User preferences")
    
    def to_firestore(self) -> dict:
        """
        Convert to Firestore-compatible dictionary.
        Excludes user_id as it's stored as document ID.
        
        Returns:
            Dict suitable for Firestore document
        """
        return {
            "email": self.email,
            "display_name": self.display_name,
            "role": self.role.value,
            "children": [
                {
                    "child_id": child.child_id,
                    "name": child.name,
                    "age": child.age,
                    "interests": child.interests,
                    "created_at": child.created_at,
                    "learning_level": child.learning_level,
                    "avatar_color": child.avatar_color
                }
                for child in self.children
            ],
            "created_at": self.created_at,
            "last_active": self.last_active,
            "preferences": self.preferences
        }
    
    @classmethod
    def from_firestore(cls, user_id: str, data: dict) -> "UserProfile":
        """
        Create UserProfile from Firestore document data.
        
        Args:
            user_id: Firebase UID (document ID)
            data: Firestore document data
            
        Returns:
            UserProfile instance
        """
        # Parse children
        children = [
            ChildProfile(**child_data)
            for child_data in data.get("children", [])
        ]
        
        return cls(
            user_id=user_id,
            email=data["email"],
            display_name=data.get("display_name"),
            role=UserRole(data.get("role", "parent")),
            children=children,
            created_at=data.get("created_at", datetime.utcnow()),
            last_active=data.get("last_active", datetime.utcnow()),
            preferences=data.get("preferences", {})
        )
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "firebase_uid_123",
                "email": "parent@example.com",
                "display_name": "Sarah Johnson",
                "role": "parent",
                "children": [
                    {
                        "child_id": "child_1",
                        "name": "Emma",
                        "age": 7,
                        "interests": ["butterflies", "flowers"],
                        "learning_level": "beginner"
                    }
                ],
                "preferences": {
                    "notifications_enabled": True,
                    "theme": "light"
                }
            }
        }


class CreateUserRequest(BaseModel):
    """Request model for creating a new user profile."""
    email: EmailStr
    display_name: Optional[str] = None
    role: UserRole = UserRole.PARENT


class AddChildRequest(BaseModel):
    """Request model for adding a child to a user profile."""
    name: str = Field(..., min_length=1, max_length=50)
    age: int = Field(..., ge=3, le=12)
    interests: List[str] = Field(default_factory=list)
    learning_level: str = Field(default="beginner")
