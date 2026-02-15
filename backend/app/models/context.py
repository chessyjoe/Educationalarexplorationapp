"""
Context Models
Represents the context loaded for each discovery processing request.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Any, Optional


@dataclass
class ChildProfile:
    """Child's profile information."""
    child_id: str
    name: str
    age: int
    started_journey: datetime
    total_discoveries: int = 0
    discovery_stats: Dict[str, int] = field(default_factory=dict)  # e.g., {"plants": 5, "insects": 3}
    interests: List[str] = field(default_factory=list)  # e.g., ["butterflies", "trees"]
    learning_style: str = "visual"  # visual, auditory, kinesthetic


@dataclass
class PipState:
    """Pip's personality and relationship state with the child."""
    relationship_level: str = "new_friend"  # new_friend, buddy, best_friend
    bond_strength: float = 0.0  # 0.0 to 1.0
    familiarity_level: str = "getting_to_know"  # getting_to_know, familiar, close
    communication_style: str = "enthusiastic"  # enthusiastic, playful, encouraging
    inside_jokes: List[str] = field(default_factory=list)
    last_interaction: Optional[datetime] = None
    interaction_count: int = 0


@dataclass
class Memory:
    """A single memory (episodic or semantic)."""
    memory_id: str
    timestamp: datetime
    memory_type: str  # "episodic" or "semantic"
    content: Dict[str, Any]
    significance: int = 5  # 1-10 scale
    emotional_weight: int = 5  # 1-10 scale
    tags: List[str] = field(default_factory=list)
    embedding: Optional[List[float]] = None  # 768-dim vector


@dataclass
class Context:
    """
    Complete context for processing a discovery.
    Loaded at the start of each request.
    """
    child_profile: ChildProfile
    recent_memories: List[Memory] = field(default_factory=list)
    pip_state: PipState = field(default_factory=PipState)
    session_id: str = ""
    timestamp: datetime = field(default_factory=datetime.now)
    system_instruction: str = ""  # Built by PromptBuilder
