from typing import Dict, Any

class StorytellerAgent:
    def __init__(self):
        self.name = "Storyteller"

    async def generate_story(self, specialist_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        species = specialist_data.get("common_name", "creature")
        child_name = context["child_profile"]["name"]
        
        return {
            "story": f"Once upon a time, {child_name} met a {species}..."
        }

class EducatorAgent:
    def __init__(self):
        self.name = "Educator"

    async def generate_activity(self, specialist_data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "activity": "Draw a picture of what you found!",
            "question": "How many colors can you see?"
        }
