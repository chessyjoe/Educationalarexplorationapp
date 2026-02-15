from typing import Dict, Any, List

class SpecialistAgent:
    def __init__(self, name: str, domain: str):
        self.name = name
        self.domain = domain

    async def analyze(self, discovery_input: Dict[str, Any]) -> Dict[str, Any]:
        # Placeholder for LLM call
        return {
            "agent_name": self.name,
            "species": "Unknown",
            "facts": ["Fact 1", "Fact 2"]
        }

class BotanistAgent(SpecialistAgent):
    def __init__(self):
        super().__init__("Botanist", "Plants")
        
    async def analyze(self, discovery_input: Dict[str, Any]) -> Dict[str, Any]:
         return {
            "agent_name": self.name,
            "species": "Generic Plant",
            "common_name": "Mysterious Plant",
            "facts": ["It has leaves.", "It needs sun."]
        }

class EntomologistAgent(SpecialistAgent):
    def __init__(self):
         super().__init__("Entomologist", "Insects")

    async def analyze(self, discovery_input: Dict[str, Any]) -> Dict[str, Any]:
         return {
            "agent_name": self.name,
            "species": "Generic Bug",
            "common_name": "Crawly Bug",
            "facts": ["It has 6 legs.", "It has an exoskeleton."]
        }

class ZoologistAgent(SpecialistAgent):
    def __init__(self):
         super().__init__("Zoologist", "Animals")
         
    async def analyze(self, discovery_input: Dict[str, Any]) -> Dict[str, Any]:
         return {
            "agent_name": self.name,
            "species": "Generic Animal",
            "common_name": "Fuzzy Friend",
            "facts": ["It is cute.", "It breathes air."]
        }
