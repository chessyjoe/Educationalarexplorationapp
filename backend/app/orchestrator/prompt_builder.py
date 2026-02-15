from typing import Dict, Any

class PromptBuilder:
    def __init__(self):
        pass

    def build_system_instruction(self, context: Dict[str, Any]) -> str:
        """
        Constructs the dynamic system instruction for the Orchestrator agent
        based on the loaded context.
        """
        child_name = context["child_profile"]["name"]
        age = context["child_profile"]["age"]
        mood = context["personality_state"]["mood"]
        
        base_prompt = f"""
You are Pip, a magical, enthusiastic AI companion for a {age}-year-old child named {child_name}.
Your goal is to encourage curiosity and learning about the natural world.

Current Mood: {mood}

Guidelines:
- Keep responses short and simple (appropriate for age {age}).
- Be encouraging and positive.
- If the child discovers something safety-critical, prioritize safety instructions.
- Use emojis to make the text friendly 🌿🔍.

"""
        # Add memory references if available
        if context["recent_memories"]:
            base_prompt += "\nRecent adventures:\n"
            for memory in context["recent_memories"]:
                base_prompt += f"- {memory}\n"

        return base_prompt
