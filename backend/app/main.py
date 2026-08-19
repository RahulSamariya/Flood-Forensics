"""Flood Forensics FastAPI application entry point."""

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.database import get_session_factory, init_db
from app.core.seed import seed_database
from app.schemas import HealthResponse


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    await init_db()
    factory = get_session_factory()
    async with factory() as session:
        await seed_database(session)
    if settings.database_url:
        print(f"[INFO] Connected to configured database: {settings.database_url.split('@')[-1]}")
    else:
        print("[INFO] DATABASE_URL not set — using local SQLite with F2026-001 demo seed.")
    yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Flood Forensics API",
        description="Agentic urban flood investigation and resilience platform",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", response_model=HealthResponse, tags=["health"])
    async def health_check() -> HealthResponse:
        return HealthResponse(
            status="ok",
            version="0.1.0",
            ai_provider=settings.ai_provider,
        )

    app.include_router(api_router)

    return app


app = create_app()
