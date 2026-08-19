"""Database connection and session management (Phase 3)."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

# Engine created lazily when DATABASE_URL is configured
_engine = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def _get_database_url() -> str | None:
    url = settings.database_url
    if not url:
        return None
    # Normalize to async driver
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for database sessions."""
    global _engine, _session_factory

    db_url = _get_database_url()
    if not db_url:
        yield None  # type: ignore[misc]
        return

    if _engine is None:
        _engine = create_async_engine(db_url, echo=False)
        _session_factory = async_sessionmaker(_engine, expire_on_commit=False)

    assert _session_factory is not None
    async with _session_factory() as session:
        yield session
