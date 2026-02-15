"""
Environment configuration for the backend.
Load environment variables and configuration settings.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Get the backend directory (parent of app directory)
backend_dir = Path(__file__).resolve().parent.parent
env_path = backend_dir / ".env"

# Load .env file from backend directory
load_dotenv(dotenv_path=env_path, override=True)

# Print for debugging (remove in production)
print(f"Loading .env from: {env_path}")
print(f".env exists: {env_path.exists()}")
print(f"GEMINI_API_KEY loaded: {bool(os.getenv('GEMINI_API_KEY'))}")

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Firebase
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID")

# App Settings
ENV = os.getenv("ENV", "development")
DEBUG = ENV == "development"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# API Settings
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"
