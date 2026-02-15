"""
Specialist Agents - Domain experts for plant, insect, and animal identification.
Uses Gemini API for species identification and fact generation.
"""
from typing import Dict, Any
from app.utils.gemini_client import get_gemini_client
from app.models.discovery import SpecialistOutput


class SpecialistAgent:
    """Base class for specialist agents."""
    
    def __init__(self, name: str, domain: str):
        self.name = name
        self.domain = domain
        self.client = get_gemini_client()
        
    async def analyze(self, discovery_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a discovery from this specialist's domain perspective.
        
        Args:
            discovery_input: Contains 'discovery_description' and metadata
            
        Returns:
            SpecialistOutput as dict
        """
        description = discovery_input.get("discovery_description", "")
        
        system_instruction = f"""You are a {self.domain} expert teaching children aged 5-10 about nature.
Your job is to identify {self.domain.lower()} and share fascinating, age-appropriate facts.

Guidelines:
- Use simple, engaging language
- Focus on cool facts kids will remember
- Mention habitat and behavior
- Include conservation status if relevant
- Be enthusiastic and encouraging"""

        prompt = f"""A child has discovered this {self.domain.lower()}:

{description}

Identify it and share interesting facts. Respond as JSON:
{{
    "species": "<species type, e.g. 'butterfly', 'oak tree'>",
    "common_name": "<common name>",
    "scientific_name": "<scientific name if identifiable>",
    "facts": ["<fact 1>", "<fact 2>", "<fact 3>"],
    "habitat": "<where it lives>",
    "conservation_status": "<if relevant>",
    "identification_confidence": <0.0 to 1.0>
}}"""

        try:
            response = await self.client.generate_with_schema(
                prompt=prompt,
                schema={
                    "species": "string",
                    "common_name": "string",
                    "scientific_name": "string or null",
                    "facts": "array of strings",
                    "habitat": "string",
                    "conservation_status": "string or null",
                    "identification_confidence": "number"
                },
                system_instruction=system_instruction,
                temperature=0.7
            )
            
            result = SpecialistOutput(
                agent_name=self.name,
                species=response.get("species"),
                common_name=response.get("common_name"),
                scientific_name=response.get("scientific_name"),
                facts=response.get("facts", []),
                habitat=response.get("habitat"),
                conservation_status=response.get("conservation_status"),
                identification_confidence=response.get("identification_confidence", 0.0)
            )
            
            return result.to_dict()
            
        except Exception as e:
            print(f"{self.name} error: {e}")
            # Return fallback response
            return SpecialistOutput(
                agent_name=self.name,
                species="Unknown",
                common_name="Mystery Discovery",
                facts=["This is an interesting discovery!", "Let's learn more about it together!"],
                habitat="Unknown",
                identification_confidence=0.3
            ).to_dict()


class BotanistAgent(SpecialistAgent):
    """Plant identification specialist."""
    def __init__(self):
        super().__init__("Botanist", "Plants")



class EntomologistAgent(SpecialistAgent):
    """Insect identification specialist."""
    def __init__(self):
        super().__init__("Entomologist", "Insects")


class ZoologistAgent(SpecialistAgent):
    """Animal identification specialist."""
    def __init__(self):
        super().__init__("Zoologist", "Animals")

