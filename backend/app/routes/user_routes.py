"""
User API Routes
Handles user profile management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from app.auth.firebase_auth import verify_firebase_token, get_user_id, get_user_email
from app.repositories.user_repository import UserRepository
from app.models.user_profile import UserProfile, AddChildRequest, ChildProfile
from typing import Dict
import logging
import uuid

router = APIRouter(prefix="/api/users", tags=["users"])
user_repo = UserRepository()
logger = logging.getLogger(__name__)


@router.get("/me")
async def get_current_user(token: Dict = Depends(verify_firebase_token)):
    """
    Get current user's profile.
    Creates profile automatically if it doesn't exist (first login).
    """
    user_id = get_user_id(token)
    email = get_user_email(token)
    display_name = token.get('name')
    
    # Get or create user profile
    user_profile = await user_repo.get_or_create_user(
        user_id=user_id,
        email=email,
        display_name=display_name
    )
    
    return user_profile.model_dump()


@router.post("/children")
async def add_child(
    child_request: AddChildRequest,
    token: Dict = Depends(verify_firebase_token)
):
    """Add a child profile to the current user's account."""
    user_id = get_user_id(token)
    
    # Create child profile
    child_profile = ChildProfile(
        child_id=f"child_{uuid.uuid4().hex[:8]}",
        name=child_request.name,
        age=child_request.age,
        interests=child_request.interests,
        learning_level=child_request.learning_level
    )
    
    # Add to user
    await user_repo.add_child(user_id, child_profile)
    
    logger.info(f"Added child {child_profile.name} to user {user_id}")
    
    return {
        "success": True,
        "child": child_profile.model_dump()
    }


@router.get("/children")
async def get_children(token: Dict = Depends(verify_firebase_token)):
    """Get all children for the current user."""
    user_id = get_user_id(token)
    
    user = await user_repo.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "children": [child.model_dump() for child in user.children]
    }


@router.put("/preferences")
async def update_preferences(
    preferences: Dict,
    token: Dict = Depends(verify_firebase_token)
):
    """Update user preferences."""
    user_id = get_user_id(token)
    
    await user_repo.update_preferences(user_id, preferences)
    
    return {"success": True, "preferences": preferences}
