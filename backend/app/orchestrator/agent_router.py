from typing import List, Dict, Any

class AgentRouter:
    def __init__(self):
        self.specialists = {
            "plant": "Botanist",
            "insect": "Entomologist",
            "animal": "Zoologist",
            "bird": "Zoologist" # Assuming Zoologist handles birds for now, or could be Ornithologist
        }

    def route_discovery(self, discovery_input: Dict[str, Any]) -> List[str]:
        """
        Determines which agents should handle the discovery based on the input.
        Returns a list of agent names.
        """
        required_agents = ["SafetyAgent"] # Always run Safety Agent
        
        # Simple keyword matching for prototype
        # In production, this would use an LLM classifier
        description = discovery_input.get("discovery_description", "").lower()
        image_data = discovery_input.get("media_data")
        
        category = "unknown"
        
        if "plant" in description or "flower" in description or "leaf" in description:
            category = "plant"
        elif "bug" in description or "insect" in description or "spider" in description:
            category = "insect"
        elif "animal" in description or "bird" in description:
            category = "animal"
            
        if category in self.specialists:
            required_agents.append(self.specialists[category])
        else:
            # If unknown, maybe trigger a general "NatureGuide" or ask clarification
            # For now, default to Botanist as fallback
            required_agents.append("Botanist")

        # Always add support agents
        required_agents.extend(["Storyteller", "Educator"])
        
        return required_agents
