"""Recommendation endpoints (Phase 3/8)."""

from fastapi import APIRouter

router = APIRouter(prefix="/recommendations")


@router.get("")
async def list_recommendations(event_id: str | None = None) -> list[dict]:
    """List permanent fix recommendations. Populated in Phase 8."""
    _ = event_id
    return []
