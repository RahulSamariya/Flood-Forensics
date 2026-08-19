"""Authentication and API security."""

from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader

from app.core.config import get_settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(api_key: str | None = Security(api_key_header)) -> str | None:
    """
    Optional API key verification.
    Returns the key if valid; None if no key configured (dev mode).
    """
    settings = get_settings()
    expected = settings.api_key

    if not expected or expected == "dev-api-key-change-in-production":
        # Development: allow unauthenticated access with warning in logs
        return api_key

    if not api_key or api_key != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return api_key
