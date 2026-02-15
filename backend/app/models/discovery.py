"""
Discovery and Safety Models
Represents discovery inputs and safety check results.
"""
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from enum import Enum


class DangerLevel(Enum):
    SAFE = "safe"
    CAUTION = "caution"
    DANGER = "danger"


@dataclass
class Discovery:
    """Input discovery from the child."""
    discovery_id: str
    child_id: str
    description: str
    location_tag: str
    media_type: str  # "text", "image", "video"
    media_data: Optional[str] = None  # base64 or URL
    timestamp: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SafetyResult:
    """
    Output from SafetyAgent.
    """
    is_dangerous: bool
    danger_level: DangerLevel
    warning_message: Optional[str] = None
    should_continue: bool = True  # Whether to continue with specialist agents
    confidence: float = 0.0  # 0.0 to 1.0
    reasoning: str = ""  # Why this safety assessment was made
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "is_dangerous": self.is_dangerous,
            "danger_level": self.danger_level.value,
            "warning_message": self.warning_message,
            "should_continue": self.should_continue,
            "confidence": self.confidence,
            "reasoning": self.reasoning
        }


@dataclass
class SpecialistOutput:
    """Output from Specialist agents (Botanist, Entomologist, Zoologist)."""
    agent_name: str
    species: Optional[str] = None
    common_name: Optional[str] = None
    scientific_name: Optional[str] = None
    facts: List[str] = field(default_factory=list)
    habitat: Optional[str] = None
    conservation_status: Optional[str] = None
    identification_confidence: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "agent_name": self.agent_name,
            "species": self.species,
            "common_name": self.common_name,
            "scientific_name": self.scientific_name,
            "facts": self.facts,
            "habitat": self.habitat,
            "conservation_status": self.conservation_status,
            "identification_confidence": self.identification_confidence
        }


@dataclass
class StoryOutput:
    """Output from StorytellerAgent."""
    story: str
    narrative_style: str = "adventure"  # adventure, mystery, educational
    memory_references: List[str] = field(default_factory=list)
    emotional_tone: str = "excited"  # excited, curious, proud
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "story": self.story,
            "narrative_style": self.narrative_style,
            "memory_references": self.memory_references,
            "emotional_tone": self.emotional_tone
        }


@dataclass
class ActivityOutput:
    """Output from EducatorAgent."""
    prompt: str
    question: str
    difficulty_level: str = "medium"  # easy, medium, hard
    learning_objective: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "prompt": self.prompt,
            "question": self.question,
            "difficulty_level": self.difficulty_level,
            "learning_objective": self.learning_objective
        }
