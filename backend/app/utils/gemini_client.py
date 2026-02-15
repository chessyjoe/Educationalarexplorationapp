"""
Gemini API Client Wrapper
Provides a simplified interface to Google's Gemini API using the google-genai package.
"""
import os
from google import genai
from google.genai import types
from typing import Optional, Dict, Any
import asyncio
from functools import wraps
import json


def async_retry(max_retries: int = 3, delay: float = 1.0):
    """Decorator to retry async functions on failure."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    await asyncio.sleep(delay * (attempt + 1))
            return None
        return wrapper
    return decorator


class GeminiClient:
    """
    Wrapper around Google Gemini API for agent use.
    Uses the new google-genai package with proper configuration.
    """
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "models/gemini-2.5-flash"):
        """
        Initialize Gemini client.
        
        Args:
            api_key: Google API key (defaults to GEMINI_API_KEY env var)
            model_name: Model to use (default: models/gemini-2.5-flash)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name
        self._client = None
        self._initialized = False
        
    def _ensure_initialized(self):
        """Lazy initialization - only validate API key when actually needed."""
        if self._initialized:
            return
            
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY not set. Please add it to backend/.env file.\n"
                "Get your free API key at: https://aistudio.google.com/app/apikey"
            )
        
        # Initialize the genai client - it automatically picks up GEMINI_API_KEY from env
        self._client = genai.Client(api_key=self.api_key)
        self._initialized = True
        
    @async_retry(max_retries=3)
    async def generate_async(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        """
        Generate text asynchronously.
        
        Args:
            prompt: User prompt
            system_instruction: System instruction for the model
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text
        """
        # Ensure API key is configured
        self._ensure_initialized()
        
        # Build generation config
        config_params = {
            'temperature': temperature,
            'max_output_tokens': max_tokens,
        }
        
        if system_instruction:
            config_params['system_instruction'] = system_instruction
        
        # Create typed config
        config = types.GenerateContentConfig(**config_params)
        
        # Run generation in executor to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
        )
        
        return response.text
    
    async def generate_with_schema(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Generate structured output matching a schema.
        
        Args:
            prompt: User prompt
            schema: JSON schema for the output
            system_instruction: System instruction
            temperature: Sampling temperature
            
        Returns:
            Parsed JSON response
        """
        # Add schema to prompt
        schema_prompt = f"{prompt}\n\nRespond ONLY with valid JSON matching this schema:\n{schema}"
        
        response_text = await self.generate_async(
            schema_prompt,
            system_instruction=system_instruction,
            temperature=temperature
        )
        
        # Parse JSON response
        # Extract JSON from markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        return json.loads(response_text)


# Global client instance (lazy-initialized)
_gemini_client: Optional[GeminiClient] = None


def get_gemini_client() -> GeminiClient:
    """Get or create the global Gemini client instance."""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client
