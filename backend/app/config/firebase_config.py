"""
Firebase Configuration Module
Handles Firebase Admin SDK initialization and provides access to Firebase services.
"""
import firebase_admin
from firebase_admin import credentials, firestore, auth
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class FirebaseConfig:
    """
    Singleton Firebase configuration manager.
    Handles lazy initialization of Firebase services.
    """
    _initialized: bool = False
    _firestore_client: Optional[firestore.Client] = None
    _app: Optional[firebase_admin.App] = None
    
    @classmethod
    def initialize(cls) -> None:
        """
        Initialize Firebase Admin SDK.

        Credential resolution order:
          1. FIREBASE_SERVICE_ACCOUNT_JSON env var (JSON string) — used on Fly.io
          2. firebase-service-account.json file in backend/ directory — used locally

        Raises:
            FileNotFoundError: If neither credential source is found
        """
        if cls._initialized:
            logger.debug("Firebase already initialized")
            return

        import os, json

        cred = None

        # --- Option 1: JSON string in env var (Fly.io / any 12-factor platform) ---
        sa_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
        if sa_json:
            try:
                sa_dict = json.loads(sa_json)
                cred = credentials.Certificate(sa_dict)
                logger.info("Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT_JSON env var")
            except Exception as e:
                logger.warning(f"Could not parse FIREBASE_SERVICE_ACCOUNT_JSON: {e}")

        # --- Option 2: JSON file on disk (local development) ---
        if cred is None:
            backend_dir = Path(__file__).resolve().parent.parent.parent
            cred_path = backend_dir / 'firebase-service-account.json'
            if cred_path.exists():
                cred = credentials.Certificate(str(cred_path))
                logger.info(f"Firebase credentials loaded from file: {cred_path}")

        if cred is None:
            raise FileNotFoundError(
                "Firebase credentials not found.\n"
                "  • Local dev: place firebase-service-account.json in backend/\n"
                "  • Fly.io: set the FIREBASE_SERVICE_ACCOUNT_JSON secret"
            )

        try:
            cls._app = firebase_admin.initialize_app(cred)
            cls._firestore_client = firestore.client()
            cls._initialized = True
            logger.info("Firebase Admin SDK initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            raise

    
    @classmethod
    def get_firestore(cls) -> firestore.Client:
        """
        Get Firestore client instance.
        Initializes Firebase if not already initialized.
        
        Returns:
            Firestore client instance
        """
        if not cls._initialized:
            cls.initialize()
        
        if cls._firestore_client is None:
            raise RuntimeError("Firestore client not initialized")
        
        return cls._firestore_client
    
    @classmethod
    def get_auth(cls):
        """
        Get Firebase Auth module.
        Initializes Firebase if not already initialized.
        
        Returns:
            Firebase Auth module
        """
        if not cls._initialized:
            cls.initialize()
        
        return auth
    
    @classmethod
    def is_initialized(cls) -> bool:
        """Check if Firebase has been initialized."""
        return cls._initialized


# Initialize Firebase on module import (lazy, only when needed)
def ensure_firebase_initialized():
    """Helper function to ensure Firebase is initialized."""
    if not FirebaseConfig.is_initialized():
        FirebaseConfig.initialize()
