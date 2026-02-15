"""
User Repository
Data access layer for user profiles in Firestore.
"""
from app.config.firebase_config import FirebaseConfig
from app.models.user_profile import UserProfile, ChildProfile, UserRole
from typing import Optional, List
from datetime import datetime
import logging
import uuid

logger = logging.getLogger(__name__)


class UserRepository:
    """Repository for user profile operations."""
    
    def __init__(self):
        """Initialize repository with Firestore client."""
        self.db = FirebaseConfig.get_firestore()
        self.users_ref = self.db.collection('users')
    
    async def create_user(self, user_profile: UserProfile) -> UserProfile:
        """
        Create new user profile in Firestore.
        
        Args:
            user_profile: UserProfile instance
            
        Returns:
            Created user profile
            
        Raises:
            Exception: If user already exists or creation fails
        """
        try:
            user_ref = self.users_ref.document(user_profile.user_id)
            
            # Check if user already exists
            if user_ref.get().exists:
                logger.warning(f"User {user_profile.user_id} already exists")
                raise ValueError(f"User with ID {user_profile.user_id} already exists")
            
            # Create user document
            user_ref.set(user_profile.to_firestore())
            logger.info(f"Created user profile for {user_profile.user_id}")
            
            return user_profile
            
        except Exception as e:
            logger.error(f"Failed to create user {user_profile.user_id}: {str(e)}")
            raise
    
    async def get_user(self, user_id: str) -> Optional[UserProfile]:
        """
        Retrieve user profile by ID.
        
        Args:
            user_id: Firebase UID
            
        Returns:
            UserProfile if found, None otherwise
        """
        try:
            doc = self.users_ref.document(user_id).get()
            
            if not doc.exists:
                logger.debug(f"User {user_id} not found")
                return None
            
            data = doc.to_dict()
            user_profile = UserProfile.from_firestore(user_id, data)
            logger.debug(f"Retrieved user profile for {user_id}")
            
            return user_profile
            
        except Exception as e:
            logger.error(f"Failed to get user {user_id}: {str(e)}")
            raise
    
    async def update_last_active(self, user_id: str) -> None:
        """
        Update user's last active timestamp.
        
        Args:
            user_id: Firebase UID
        """
        try:
            self.users_ref.document(user_id).update({
                'last_active': datetime.utcnow()
            })
            logger.debug(f"Updated last_active for user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to update last_active for {user_id}: {str(e)}")
            # Don't raise - this is not critical
    
    async def add_child(self, user_id: str, child_profile: ChildProfile) -> None:
        """
        Add child profile to user.
        
        Args:
            user_id: Firebase UID
            child_profile: ChildProfile instance
            
        Raises:
            Exception: If update fails
        """
        try:
            from google.cloud.firestore import ArrayUnion
            
            self.users_ref.document(user_id).update({
                'children': ArrayUnion([{
                    "child_id": child_profile.child_id,
                    "name": child_profile.name,
                    "age": child_profile.age,
                    "interests": child_profile.interests,
                    "created_at": child_profile.created_at,
                    "learning_level": child_profile.learning_level,
                    "avatar_color": child_profile.avatar_color
                }])
            })
            logger.info(f"Added child {child_profile.name} to user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to add child to user {user_id}: {str(e)}")
            raise
    
    async def get_or_create_user(
        self, 
        user_id: str, 
        email: str, 
        display_name: Optional[str] = None
    ) -> UserProfile:
        """
        Get existing user or create new one if doesn't exist.
        Useful for handling first-time users.
        
        Args:
            user_id: Firebase UID
            email: User email
            display_name: Optional display name
            
        Returns:
            UserProfile instance
        """
        # Try to get existing user
        user = await self.get_user(user_id)
        
        if user is not None:
            # User exists, update last active
            await self.update_last_active(user_id)
            return user
        
        # Create new user
        new_user = UserProfile(
            user_id=user_id,
            email=email,
            display_name=display_name,
            role=UserRole.PARENT,
            children=[],
            created_at=datetime.utcnow(),
            last_active=datetime.utcnow(),
            preferences={}
        )
        
        return await self.create_user(new_user)
    
    async def update_preferences(self, user_id: str, preferences: dict) -> None:
        """
        Update user preferences.
        
        Args:
            user_id: Firebase UID
            preferences: Dict of preference key-value pairs
        """
        try:
            self.users_ref.document(user_id).update({
                'preferences': preferences
            })
            logger.info(f"Updated preferences for user {user_id}")
            
        except Exception as e:
            logger.error(f"Failed to update preferences for {user_id}: {str(e)}")
            raise
