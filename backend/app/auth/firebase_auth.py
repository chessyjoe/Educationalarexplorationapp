"""
Firebase Authentication Module
Provides middleware and utilities for authenticating API requests using Firebase ID tokens.
"""
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer()


async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> Dict:
    """
    FastAPI dependency to verify Firebase ID tokens.
    
    This middleware:
    1. Extracts the Bearer token from the Authorization header
    2. Verifies the token with Firebase Auth
    3. Returns the decoded token containing user information
    
    Args:
        credentials: HTTP Authorization credentials from request header
        
    Returns:
        Dict containing decoded token with user info (uid, email, etc.)
        
    Raises:
        HTTPException: 401 if token is invalid, expired, or missing
        
    Example:
        ```python
        @app.get("/api/protected")
        async def protected_route(token: Dict = Depends(verify_firebase_token)):
            user_id = token['uid']
            return {"user_id": user_id}
        ```
    """
    from app.config.firebase_config import FirebaseConfig
    from firebase_admin import auth
    
    try:
        # Extract token from credentials
        token = credentials.credentials
        
        # Verify the ID token with Firebase
        decoded_token = auth.verify_id_token(token)
        
        logger.info(f"Token verified for user: {decoded_token.get('uid')}")
        return decoded_token
        
    except auth.InvalidIdTokenError:
        logger.warning("Invalid Firebase ID token provided")
        raise HTTPException(
            status_code=401, 
            detail="Invalid authentication token"
        )
    except auth.ExpiredIdTokenError:
        logger.warning("Expired Firebase ID token provided")
        raise HTTPException(
            status_code=401, 
            detail="Authentication token has expired. Please sign in again."
        )
    except auth.RevokedIdTokenError:
        logger.warning("Revoked Firebase ID token provided")
        raise HTTPException(
            status_code=401,
            detail="Authentication token has been revoked"
        )
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise HTTPException(
            status_code=401, 
            detail=f"Authentication failed: {str(e)}"
        )


def get_user_id(token: Dict) -> str:
    """
    Extract user ID (UID) from decoded Firebase token.
    
    Args:
        token: Decoded Firebase ID token
        
    Returns:
        User's unique Firebase UID
        
    Raises:
        KeyError: If 'uid' not present in token
    """
    uid = token.get('uid')
    if not uid:
        raise HTTPException(
            status_code=401,
            detail="User ID not found in token"
        )
    return uid


def get_user_email(token: Dict) -> Optional[str]:
    """
    Extract user email from decoded Firebase token.
    
    Args:
        token: Decoded Firebase ID token
        
    Returns:
        User's email address, or None if not available
    """
    return token.get('email')


def get_user_name(token: Dict) -> Optional[str]:
    """
    Extract user display name from decoded Firebase token.
    
    Args:
        token: Decoded Firebase ID token
        
    Returns:
        User's display name, or None if not available
    """
    return token.get('name')


async def get_optional_credentials(
    authorization: Optional[str] = None
) -> Optional[HTTPAuthorizationCredentials]:
    """
    Extract optional Bearer token from Authorization header.
    Returns None if no Authorization header is provided.
    """
    if authorization is None:
        return None
    
    # Parse Bearer token manually
    if not authorization.startswith("Bearer "):
        return None
    
    token = authorization[7:]  # Remove "Bearer " prefix
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


# Optional security scheme
optional_security = HTTPBearer(auto_error=False)

async def optional_auth(
    creds: Optional[HTTPAuthorizationCredentials] = Security(optional_security)
) -> Optional[Dict]:
    """
    Optional authentication dependency.
    Similar to verify_firebase_token but doesn't raise an error if no token is provided.
    
    Useful for endpoints that can work with or without authentication.
    
    Args:
        creds: HTTP Authorization credentials (optional)
        
    Returns:
        Decoded token dict if valid token provided, None otherwise
    """
    if not creds:
        return None
    
    try:
        from firebase_admin import auth
        token = creds.credentials
        return auth.verify_id_token(token)
    except Exception as e:
        logger.debug(f"Optional auth failed: {str(e)}")
        return None
