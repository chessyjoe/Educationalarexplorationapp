from typing import Dict, Any

class ResponseSynthesizer:
    def __init__(self):
        pass

    def synthesize_response(self, agent_results: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combines all agent outputs into the final Pip Response Model.
        """
        
        # Check Safety First
        safety = agent_results.get("SafetyAgent", {})
        if safety.get("is_dangerous", False):
            return {
                "type": "safety_warning",
                "content": safety.get("warning_message", "Be careful! That looks dangerous.")
            }

        specialist = agent_results.get("Specialist", {})
        story = agent_results.get("Storyteller", {})
        educator = agent_results.get("Educator", {})
        
        child_name = context["child_profile"]["name"]

        agent_name = specialist.get("agent_name", "")
        disc_type = "flora" if agent_name == "Botanist" else "fauna" if agent_name in ["Zoologist", "Entomologist"] else "unknown"

        response = {
            "greeting": f"Wow, {child_name}! Look what you found!",
            "identification": {
                "name": specialist.get("common_name") or "Mystery Object",
                "scientific_name": specialist.get("scientific_name") or specialist.get("species"),
                "facts": specialist.get("facts") or [],
                "color": specialist.get("color") or "unknown",
                "habitat": specialist.get("habitat") or "unknown",
                "type": disc_type
            },
            "story": story.get("story"),
            "activity": {
                "prompt": educator.get("prompt"),
                "question": educator.get("question")
            },
            "metadata": {
                "agents_involved": list(agent_results.keys())
            }
        }
        
        return response
