"""
Memory Manager
Persistent episodic and semantic memory using Firestore via DiscoveryRepository.
"""
from typing import Dict, Any, List, Optional
from app.repositories.discovery_repository import DiscoveryRepository
import logging

logger = logging.getLogger(__name__)


class MemoryManager:
    """
    Manages child-specific memories across sessions.
    Episodic: tracks specific discovery events.
    Semantic: maintains summary-level knowledge patterns.
    """

    def __init__(self):
        self.episodic = EpisodicMemoryManager()
        self.semantic = SemanticMemoryManager()

    async def store_memory(self, memory_data: Dict[str, Any]):
        """Stores a new memory — typically called after a discovery is processed."""
        await self.episodic.add_episode(memory_data)
        await self.semantic.update_knowledge(memory_data)

    async def retrieve_memories(
        self,
        query: str,
        context: Dict[str, Any],
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant past memories for the current discovery context.
        Args:
            query: Search query (e.g. species name)
            context: Loaded child context (contains child_id)
            limit: Max memories to return
        Returns:
            List of memory dicts
        """
        user_id = context.get("child_profile", {}).get("id")
        return await self.episodic.search(query, user_id=user_id, limit=limit)


class EpisodicMemoryManager:
    """Handles episode-level memories using Firestore discovery records."""

    def __init__(self):
        self.discovery_repo = DiscoveryRepository()

    async def add_episode(self, episode: Dict[str, Any]):
        """
        Episodes are stored as DiscoveryRecords by the main pipeline.
        This is a no-op here — called for completeness but saves happen upstream.
        """
        discovery_id = episode.get("id") or episode.get("discovery_id")
        logger.debug(f"EpisodicMemory: episode {discovery_id} already stored by pipeline")

    async def search(
        self,
        query: str,
        user_id: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Return recent discoveries as episodic memories.
        In future this will use vector similarity; for now returns last N by date.
        """
        if not user_id or user_id in ("anonymous", "default_child"):
            return []

        try:
            discoveries = await self.discovery_repo.get_user_discoveries(
                user_id=user_id, limit=limit
            )
            memories = []
            for d in discoveries:
                common_name = ""
                if d.species_info:
                    common_name = d.species_info.get("common_name", "")
                elif d.raw_species_data:
                    common_name = d.raw_species_data.get("common_name", "")

                if common_name:
                    memories.append({
                        "id": d.discovery_id,
                        "content": f"Found a {common_name}",
                        "timestamp": d.timestamp.isoformat() if d.timestamp else None
                    })
            return memories
        except Exception as e:
            logger.error(f"EpisodicMemory.search error: {e}")
            return []


class SemanticMemoryManager:
    """
    Maintains summary-level patterns (interests, preferred topics).
    Stub — will be backed by a vector DB or Firestore aggregate in future.
    """

    async def update_knowledge(self, data: Dict[str, Any]):
        """Update semantic knowledge from a new discovery. Future: upsert embeddings."""
        species = data.get("common_name") or data.get("species")
        user_id = data.get("user_id")
        if species:
            logger.debug(f"SemanticMemory: noted interest in '{species}' for user {user_id}")
