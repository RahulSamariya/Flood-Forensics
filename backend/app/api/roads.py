"""Road network endpoints (Phase 3)."""

from fastapi import APIRouter

router = APIRouter(prefix="/roads")


@router.get("")
async def list_roads() -> list[dict]:
    """List road network. Populated in Phase 2/3."""
    return []
