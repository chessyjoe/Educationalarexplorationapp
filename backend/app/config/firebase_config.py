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
        Loads credentials from firebase-service-account.json file.
        
        Raises:
            FileNotFoundError: If service account JSON file is not found
        """
        if cls._initialized:
            logger.debug("Firebase already initialized")
            return
        
        # Get path to service account credentials
        # Get path to service account credentials
        # __file__ is backend/app/config/firebase_config.py
        # .parent is backend/app/config
        # .parent.parent is backend/app
        # .parent.parent.parent is backend
        backend_dir = Path(__file__).resolve().parent.parent.parent
        cred_path = backend_dir / 'firebase-service-account.json'
        
        if not cred_path.exists():
            raise FileNotFoundError(
                f"Firebase credentials not found at {cred_path}\n"
                "Download from Firebase Console → Project Settings → Service Accounts\n"
                "Make sure the file is named 'firebase-service-account.json' and placed in backend/ directory"
            )
        
        try:
            # Initialize Firebase Admin with service account
            cred = credentials.Certificate(str(cred_path))
            cls._app = firebase_admin.initialize_app(cred)
            
            # Initialize Firestore client
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
