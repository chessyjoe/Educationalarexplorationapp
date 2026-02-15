"""
Execution Plan Model
Defines how agents should be executed by the ExecutionManager.
"""
from dataclasses import dataclass, field
from typing import List, Dict


@dataclass
class ExecutionPlan:
    """
    Plan for executing multiple agents with priorities and parallelization.
    """
    agents: List[str]  # List of agent names
    priorities: Dict[str, int]  # Agent name -> priority (1=highest, 3=lowest)
    blocking_agents: List[str] = field(default_factory=list)  # Agents that block subsequent execution
    parallel_groups: List[List[str]] = field(default_factory=list)  # Groups of agents to run in parallel
    
    def __post_init__(self):
        """Validate execution plan on creation."""
        # Ensure all agents have priorities
        for agent in self.agents:
            if agent not in self.priorities:
                raise ValueError(f"Agent '{agent}' missing priority assignment")
        
        # Ensure blocking agents are in the agent list
        for agent in self.blocking_agents:
            if agent not in self.agents:
                raise ValueError(f"Blocking agent '{agent}' not in agent list")
    
    def get_agents_by_priority(self, priority: int) -> List[str]:
        """Get all agents with a specific priority."""
        return [agent for agent, p in self.priorities.items() if p == priority]
    
    def is_blocking(self, agent_name: str) -> bool:
        """Check if an agent is blocking."""
        return agent_name in self.blocking_agents
