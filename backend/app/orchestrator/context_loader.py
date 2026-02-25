from typing import Dict, Any
from app.repositories.user_repository import UserRepository
from app.repositories.discovery_repository import DiscoveryRepository


class ContextLoader:
    def __init__(self):
        self.user_repo = UserRepository()
        self.discovery_repo = DiscoveryRepository()

    async def load_context(self, child_id: str) -> Dict[str, Any]:
        """
        Loads the complete context for a child, including profile and recent memories.
        Falls back to safe defaults if child_id is missing or not found.
        """
        child_profile = {
            "id": child_id or "anonymous",
            "name": "Explorer",
            "age": 7,
            "interests": ["nature", "space"]
        }
        recent_memories = []

        # Try to load real child profile from Firestore
        if child_id and child_id != "default_child":
            try:
                # child_id may be a user_id or a child sub-id depending on flow
                user = await self.user_repo.get_user(child_id)
                if user:
                    # Use the parent user's first child profile if available
                    if user.children:
                        child = user.children[0]
                        child_profile = {
                            "id": child.child_id,
                            "name": child.name,
                            "age": child.age,
                            "interests": child.interests or ["nature"]
                        }
                    else:
                        # Use the authenticated user's display name
                        child_profile["name"] = user.display_name or "Explorer"

                # Load last 3 discoveries as memory context
                discoveries = await self.discovery_repo.get_user_discoveries(
                    user_id=child_id, limit=3
                )
                for d in discoveries:
                    species = d.species_info.get("common_name", "") if d.species_info else ""
                    if species:
                        recent_memories.append(f"Found a {species}")
            except Exception as e:
                print(f"ContextLoader: Could not load profile for {child_id}: {e}")
                # Fall through to defaults already set above

        return {
            "child_profile": child_profile,
            "recent_memories": recent_memories,
            "personality_state": {
                "mood": "enthusiastic",
                "relationship_level": 1
            }
        }
