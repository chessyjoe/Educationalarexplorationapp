from typing import Dict, Any

class SafetyAgent:
    def __init__(self):
        self.name = "Safety Agent"

    async def evaluate_safety(self, discovery_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates the discovery for potential dangers.
        """
        # In a real implementation, this would use an LLM or image classifier
        # to detect dangerous bugs, plants, etc.
        description = discovery_input.get("discovery_description", "").lower()
        
        is_safe = True
        warning = None
        
        if "spider" in description or "snake" in description:
             # Simple keyword check for prototype
             is_safe = False
             warning = "Be careful! Some spiders/snakes can be dangerous. Don't touch it!"

        return {
            "is_safe": is_safe,
            "warning": warning,
            "confidence": 0.9
        }
