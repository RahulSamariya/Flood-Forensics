"""Road network endpoints (Phase 3) — returns demo data."""

from fastapi import APIRouter

from app.services.demo_data import ROADS

router = APIRouter(prefix="/roads")


@router.get("")
async def list_roads() -> list[dict]:
    """List all road segments."""
    return ROADS
