"""
Gemini API Client Wrapper
Provides a simplified interface to Google's Gemini API using the google-genai package.
"""
import os
from google import genai
from google.genai import types
from typing import Optional, Dict, Any, List, Union
import asyncio
import base64
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
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "gemini-2.0-flash"):
        """
        Initialize Gemini client.
        
        Args:
            api_key: Google API key (defaults to GEMINI_API_KEY env var)
            model_name: Model to use (default: gemini-2.0-flash)
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
        response_mime_type: str = "text/plain",
    ) -> str:
        """
        Generate text asynchronously.
        
        Args:
            prompt: User prompt
            system_instruction: System instruction for the model
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens to generate
            response_mime_type: Mime type for the response
            
        Returns:
            Generated text
        """
        # Ensure API key is configured
        self._ensure_initialized()
        
        # Build generation config
        config_params = {
            'temperature': temperature,
            'max_output_tokens': max_tokens,
            'response_mime_type': response_mime_type,
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
    
    # ------------------------------------------------------------------
    # Schema helpers
    # ------------------------------------------------------------------

    _TYPE_MAP = {
        "string": "STRING",
        "number": "NUMBER",
        "integer": "INTEGER",
        "boolean": "BOOLEAN",
        "array": "ARRAY",
        "object": "OBJECT",
    }

    def _build_native_schema(self, schema_dict: Dict[str, Any]) -> types.Schema:
        """
        Convert a simple {"field": "type_string"} dict into a types.Schema.
        Supports type strings like "string", "number", "boolean",
        "array of strings", "string or null".
        """
        properties: Dict[str, types.Schema] = {}
        required: List[str] = []

        for field, type_str in schema_dict.items():
            type_lower = str(type_str).lower()
            nullable = "or null" in type_lower
            type_lower = type_lower.replace("or null", "").strip()

            if "array" in type_lower:
                item_type = "STRING"  # default item type
                for k, v in self._TYPE_MAP.items():
                    if k in type_lower and k != "array":
                        item_type = v
                        break
                prop = types.Schema(
                    type=types.Type.ARRAY,
                    items=types.Schema(type=getattr(types.Type, item_type)),
                    nullable=nullable,
                )
            else:
                mapped = self._TYPE_MAP.get(type_lower, "STRING")
                prop = types.Schema(
                    type=getattr(types.Type, mapped),
                    nullable=nullable,
                )

            properties[field] = prop
            if not nullable:
                required.append(field)

        return types.Schema(
            type=types.Type.OBJECT,
            properties=properties,
            required=required if required else None,
        )

    async def generate_with_schema(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Generate structured output matching a schema (legacy text-prompt approach).
        Kept as fallback; prefer generate_with_native_schema for new code.
        """
        # Add schema to prompt
        schema_prompt = f"{prompt}\n\nRespond ONLY with valid JSON matching this schema:\n{schema}"
        
        response_text = await self.generate_async(
            schema_prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            response_mime_type="application/json",
        )
        
        # Parse JSON response — strip markdown fences if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        return json.loads(response_text)

    @async_retry(max_retries=3)
    async def generate_with_native_schema(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Generate structured output using Gemini's native response_schema.
        This guarantees the model outputs JSON that exactly matches the schema.

        Args:
            prompt: User prompt
            schema: Simple {"field": "type"} dict (e.g. {"name": "string", "score": "number"})
            system_instruction: Optional system instruction
            temperature: Sampling temperature

        Returns:
            Parsed JSON dict guaranteed to conform to schema
        """
        self._ensure_initialized()

        native_schema = self._build_native_schema(schema)

        config_params: Dict[str, Any] = {
            "temperature": temperature,
            "max_output_tokens": 2048,
            "response_mime_type": "application/json",
            "response_schema": native_schema,
        }
        if system_instruction:
            config_params["system_instruction"] = system_instruction

        config = types.GenerateContentConfig(**config_params)

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            ),
        )

        return json.loads(response.text)

    @async_retry(max_retries=3)
    async def generate_with_image(
        self,
        image_base64: str,
        prompt: str,
        schema: Dict[str, Any],
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        use_native_schema: bool = True,
    ) -> Dict[str, Any]:
        """
        Generate structured output from an image + text prompt.

        Args:
            image_base64: Base64-encoded JPEG/PNG string (with or without data: prefix)
            prompt: The text prompt to send alongside the image
            schema: Simple {"field": "type"} dict for the expected output
            system_instruction: System instruction for the model
            temperature: Sampling temperature
            use_native_schema: If True (default) use Gemini native response_schema

        Returns:
            Parsed JSON response dict
        """
        self._ensure_initialized()

        # Strip the data:image/...;base64, prefix if present
        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]

        mime_type = "image/jpeg"

        config_params: Dict[str, Any] = {
            "temperature": temperature,
            "max_output_tokens": 2048,
            "response_mime_type": "application/json",
        }
        if use_native_schema:
            config_params["response_schema"] = self._build_native_schema(schema)
        if system_instruction:
            config_params["system_instruction"] = system_instruction
        config = types.GenerateContentConfig(**config_params)

        image_part = types.Part.from_bytes(
            data=base64.b64decode(image_base64),
            mime_type=mime_type,
        )
        text_part = types.Part.from_text(text=prompt)

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self._client.models.generate_content(
                model=self.model_name,
                contents=[image_part, text_part],
                config=config,
            ),
        )

        return json.loads(response.text)


# Global client instance (lazy-initialized)
_gemini_client: Optional[GeminiClient] = None


def get_gemini_client() -> GeminiClient:
    """Get or create the global Gemini client instance."""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client
