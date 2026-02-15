"""
Support Agents - Generate stories and educational activities.
Uses Gemini API for creative content generation.
"""
from typing import Dict, Any
from app.utils.gemini_client import get_gemini_client
from app.models.discovery import StoryOutput, ActivityOutput


class StorytellerAgent:
    """Generates engaging stories about discoveries."""
    
    def __init__(self):
        self.client = get_gemini_client()
        
    async def generate_story(self, specialist_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an engaging story about the discovery.
        
        Args:
            specialist_data: Output from specialist agent
            context: Child's context (name, age, etc.)
            
        Returns:
            StoryOutput as dict
        """
        child_name = context.get("child_profile", {}).get("name", "Explorer")
        species = specialist_data.get("common_name", "creature")
        facts = specialist_data.get("facts", [])
        
        system_instruction = """You are Pip, a friendly AI companion who tells engaging stories to children aged 5-10.
Your stories should:
- Be 2-3 short paragraphs
- Include the child as the hero
- Weave in educational facts naturally
- Use vivid, imaginative language
- Be exciting but age-appropriate
- End with encouragement to keep exploring"""

        prompt = f"""Create a short adventure story for {child_name} about discovering a {species}.

Facts to weave in: {', '.join(facts[:2]) if facts else 'interesting creature'}

Respond as JSON:
{{
    "story": "<2-3 paragraph story>",
    "narrative_style": "<adventure/mystery/educational>",
    "emotional_tone": "<excited/curious/proud/wonder>"
}}"""

        try:
            response = await self.client.generate_with_schema(
                prompt=prompt,
                schema={
                    "story": "string",
                    "narrative_style": "string",
                    "emotional_tone": "string"
                },
                system_instruction=system_instruction,
                temperature=0.9  # High creativity for stories
            )
            
            result = StoryOutput(
                story=response["story"],
                narrative_style=response.get("narrative_style", "adventure"),
                emotional_tone=response.get("emotional_tone", "excited")
            )
            
            return result.to_dict()
            
        except Exception as e:
            print(f"StorytellerAgent error: {e}")
            return StoryOutput(
                story=f"Wow, {child_name}! You found a {species}! What an amazing discovery! Keep exploring and learning about the world around you.",
                narrative_style="adventure",
                emotional_tone="excited"
            ).to_dict()


class EducatorAgent:
    """Generates educational activities and questions."""
    
    def __init__(self):
        self.client = get_gemini_client()
        
    async def generate_activity(self, specialist_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an educational activity based on the discovery.
        
        Args:
            specialist_data: Output from specialist agent
            
        Returns:
            ActivityOutput as dict
        """
        species = specialist_data.get("common_name", "discovery")
        facts = specialist_data.get("facts", [])
        
        system_instruction = """You are an elementary education expert creating activities for children aged 5-10.
Your activities should:
- Be hands-on and engaging
- Reinforce what they just learned
- Be doable with common materials
- Include a thought-provoking question
- Encourage further exploration"""

        prompt = f"""Create a fun educational activity about {species}.

Facts learned: {', '.join(facts[:2]) if facts else 'interesting facts'}

Respond as JSON:
{{
    "prompt": "<activity description>",
    "question": "<follow-up question to make them think>",
    "difficulty_level": "<easy/medium/hard>",
    "learning_objective": "<what they'll learn>"
}}"""

        try:
            response = await self.client.generate_with_schema(
                prompt=prompt,
                schema={
                    "prompt": "string",
                    "question": "string",
                    "difficulty_level": "string",
                    "learning_objective": "string"
                },
                system_instruction=system_instruction,
                temperature=0.8
            )
            
            result = ActivityOutput(
                prompt=response["prompt"],
                question=response["question"],
                difficulty_level=response.get("difficulty_level", "medium"),
                learning_objective=response.get("learning_objective", "")
            )
            
            return result.to_dict()
            
        except Exception as e:
            print(f"EducatorAgent error: {e}")
            return ActivityOutput(
                prompt=f"Try drawing what you discovered! Pay attention to the colors and shapes.",
                question=f"Can you find another {species} nearby?",
                difficulty_level="easy",
                learning_objective="Observation and pattern recognition"
            ).to_dict()
