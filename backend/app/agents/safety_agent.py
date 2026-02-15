"""
Safety Agent - Checks if discoveries are potentially dangerous.
Uses Gemini API for intelligent safety assessment.
"""
from typing import Dict, Any
from app.utils.gemini_client import get_gemini_client
from app.models.discovery import SafetyResult, DangerLevel


class SafetyAgent:
    """
    Evaluates the safety of discovered organisms/objects.
    This agent runs FIRST and can block further processing if dangerous.
    """
    
    def __init__(self):
        self.client = get_gemini_client()
        self.system_instruction = """You are a safety assessment expert for children aged 5-10 exploring nature.
Your ONLY job is to determine if what they've discovered could be dangerous.

Evaluate based on:
- Venomous/poisonous species (spiders, snakes, plants)
- Sharp or harmful physical features
- Aggressive animal behavior
- Toxic substances

Respond with:
- SAFE: No significant danger
- CAUTION: Could be harmful if mishandled (most insects, thorny plants)
- DANGER: Potentially serious risk (venomous snakes, poisonous mushrooms)

Always err on the side of caution when uncertain."""
    
    async def evaluate_safety(self, discovery_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate if a discovery is safe for children.
        
        Args:
            discovery_input: Contains 'discovery_description' and other metadata
            
        Returns:
            SafetyResult as dict
        """
        description = discovery_input.get("discovery_description", "")
        
        # Build prompt
        prompt = f"""Evaluate the safety of this discovery for a child:

Discovery: {description}

Provide your assessment as JSON:
{{
    "is_dangerous": <true/false>,
    "danger_level": "<safe/caution/danger>",
    "warning_message": "<message for child if dangerous, null if safe>",
    "should_continue": <true/false - whether to continue with more details>,
    "confidence": <0.0 to 1.0>,
    "reasoning": "<brief explanation>"
}}"""
        
        try:
            # Call Gemini API
            response = await self.client.generate_with_schema(
                prompt=prompt,
                schema={
                    "is_dangerous": "boolean",
                    "danger_level": "string",
                    "warning_message": "string or null",
                    "should_continue": "boolean",
                    "confidence": "number",
                    "reasoning": "string"
                },
                system_instruction=self.system_instruction,
                temperature=0.3  # Low temperature for consistent safety checks
            )
            
            # Convert to SafetyResult
            danger_level_map = {
                "safe": DangerLevel.SAFE,
                "caution": DangerLevel.CAUTION,
                "danger": DangerLevel.DANGER
            }
            
            result = SafetyResult(
                is_dangerous=response["is_dangerous"],
                danger_level=danger_level_map.get(response["danger_level"].lower(), DangerLevel.SAFE),
                warning_message=response.get("warning_message"),
                should_continue=response["should_continue"],
                confidence=response["confidence"],
                reasoning=response.get("reasoning", "")
            )
            
            return result.to_dict()
            
        except Exception as e:
            print(f"SafetyAgent error: {e}")
            # Fail safe: if error, assume caution
            return SafetyResult(
                is_dangerous=False,
                danger_level=DangerLevel.CAUTION,
                warning_message="I'm not sure about this one. Let's be careful!",
                should_continue=True,
                confidence=0.5,
                reasoning="Error in safety check - defaulting to caution"
            ).to_dict()
