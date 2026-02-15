"""
Discovery Repository
Data access layer for discovery records in Firestore.
"""
from app.config.firebase_config import FirebaseConfig
from app.models.discovery_record import DiscoveryRecord
from typing import List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class DiscoveryRepository:
    """Repository for discovery record operations."""
    
    def __init__(self):
        """Initialize repository with Firestore client."""
        self.db = FirebaseConfig.get_firestore()
        self.discoveries_ref = self.db.collection('discoveries')
    
    async def save_discovery(self, discovery: DiscoveryRecord) -> str:
        """
        Save discovery to Firestore.
        
        Args:
            discovery: DiscoveryRecord instance
            
        Returns:
            Discovery ID (document ID)
            
        Raises:
            Exception: If save fails
        """
        try:
            # Use discovery_id as document ID
            doc_ref = self.discoveries_ref.document(discovery.discovery_id)
            doc_ref.set(discovery.to_firestore())
            
            logger.info(f"Saved discovery {discovery.discovery_id} for user {discovery.user_id}")
            return discovery.discovery_id
            
        except Exception as e:
            logger.error(f"Failed to save discovery: {str(e)}")
            raise
    
    async def get_discovery(self, discovery_id: str) -> Optional[DiscoveryRecord]:
        """
        Retrieve single discovery by ID.
        
        Args:
            discovery_id: Discovery document ID
            
        Returns:
            DiscoveryRecord if found, None otherwise
        """
        try:
            doc = self.discoveries_ref.document(discovery_id).get()
            
            if not doc.exists:
                logger.debug(f"Discovery {discovery_id} not found")
                return None
            
            data = doc.to_dict()
            discovery = DiscoveryRecord.from_firestore(discovery_id, data)
            
            return discovery
            
        except Exception as e:
            logger.error(f"Failed to get discovery {discovery_id}: {str(e)}")
            raise
    
    async def get_user_discoveries(
        self, 
        user_id: str, 
        limit: int = 50,
        child_id: Optional[str] = None,
        page: int = 1
    ) -> List[DiscoveryRecord]:
        """
        Retrieve user's discoveries with optional filtering.
        
        Args:
            user_id: Firebase UID
            limit: Maximum number of discoveries to return
            child_id: Optional filter by specific child
            page: Page number for pagination (1-indexed)
            
        Returns:
            List of DiscoveryRecord instances
        """
        try:
            query = self.discoveries_ref.where('user_id', '==', user_id)
            
            # Filter by child if specified
            if child_id:
                query = query.where('child_id', '==', child_id)
            
            # Order by timestamp (newest first)
            query = query.order_by('timestamp', direction='DESCENDING')
            
            # Apply pagination
            offset = (page - 1) * limit
            query = query.limit(limit).offset(offset)
            
            # Execute query
            docs = query.stream()
            
            discoveries = [
                DiscoveryRecord.from_firestore(doc.id, doc.to_dict())
                for doc in docs
            ]
            
            logger.info(f"Retrieved {len(discoveries)} discoveries for user {user_id}")
            return discoveries
            
        except Exception as e:
            logger.error(f"Failed to get discoveries for user {user_id}: {str(e)}")
            raise
    
    async def get_recent_discoveries(
        self, 
        user_id: str, 
        days: int = 7
    ) -> List[DiscoveryRecord]:
        """
        Get discoveries from the last N days.
        
        Args:
            user_id: Firebase UID
            days: Number of days to look back
            
        Returns:
            List of DiscoveryRecord instances
        """
        try:
            since = datetime.utcnow() - timedelta(days=days)
            
            query = (self.discoveries_ref
                    .where('user_id', '==', user_id)
                    .where('timestamp', '>=', since)
                    .order_by('timestamp', direction='DESCENDING'))
            
            docs = query.stream()
            
            discoveries = [
                DiscoveryRecord.from_firestore(doc.id, doc.to_dict())
                for doc in docs
            ]
            
            logger.info(f"Retrieved {len(discoveries)} recent discoveries for user {user_id}")
            return discoveries
            
        except Exception as e:
            logger.error(f"Failed to get recent discoveries for {user_id}: {str(e)}")
            raise
    
    async def get_favorites(self, user_id: str) -> List[DiscoveryRecord]:
        """
        Get user's favorite discoveries.
        
        Args:
            user_id: Firebase UID
            
        Returns:
            List of favorite DiscoveryRecord instances
        """
        try:
            query = (self.discoveries_ref
                    .where('user_id', '==', user_id)
                    .where('favorite', '==', True)
                    .order_by('timestamp', direction='DESCENDING'))
            
            docs = query.stream()
            
            discoveries = [
                DiscoveryRecord.from_firestore(doc.id, doc.to_dict())
                for doc in docs
            ]
            
            logger.info(f"Retrieved {len(discoveries)} favorite discoveries for user {user_id}")
            return discoveries
            
        except Exception as e:
            logger.error(f"Failed to get favorite discoveries for {user_id}: {str(e)}")
            raise
    
    async def update_discovery(
        self, 
        discovery_id: str, 
        updates: dict
    ) -> None:
        """
        Update specific fields of a discovery.
        
        Args:
            discovery_id: Discovery document ID
            updates: Dict of fields to update
            
        Raises:
            Exception: If update fails
        """
        try:
            self.discoveries_ref.document(discovery_id).update(updates)
            logger.info(f"Updated discovery {discovery_id}")
            
        except Exception as e:
            logger.error(f"Failed to update discovery {discovery_id}: {str(e)}")
            raise
    
    async def mark_favorite(self, discovery_id: str, favorite: bool = True) -> None:
        """
        Mark/unmark discovery as favorite.
        
        Args:
            discovery_id: Discovery document ID
            favorite: True to mark as favorite, False to unmark
        """
        await self.update_discovery(discovery_id, {'favorite': favorite})
    
    async def count_user_discoveries(self, user_id: str) -> int:
        """
        Count total discoveries for a user.
        
        Args:
            user_id: Firebase UID
            
        Returns:
            Total count of discoveries
        """
        try:
            query = self.discoveries_ref.where('user_id', '==', user_id)
            docs = list(query.stream())
            count = len(docs)
            
            logger.debug(f"User {user_id} has {count} total discoveries")
            return count
            
        except Exception as e:
            logger.error(f"Failed to count discoveries for {user_id}: {str(e)}")
            raise
