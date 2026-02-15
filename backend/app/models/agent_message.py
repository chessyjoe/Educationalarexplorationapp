"""
Agent Message Model
Represents messages passed between orchestrator and agents.
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional
from enum import Enum


class MessageStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"


@dataclass
class AgentMessage:
    """
    Message passed between orchestrator and agents.
    """
    message_id: str
    timestamp: datetime
    sender: str
    recipient: str
    message_type: str  # e.g., "discovery", "query", "response"
    content: Dict[str, Any]
    priority: int = 2  # 1 (highest) to 3 (lowest)
    timeout_ms: int = 5000  # Default 5 second timeout
    status: MessageStatus = MessageStatus.PENDING
    metadata: Optional[Dict[str, Any]] = field(default_factory=dict)
    
    def __post_init__(self):
        """Validate message on creation."""
        if self.priority not in [1, 2, 3]:
            raise ValueError(f"Priority must be 1, 2, or 3. Got: {self.priority}")
        if self.timeout_ms <= 0:
            raise ValueError(f"Timeout must be positive. Got: {self.timeout_ms}")
