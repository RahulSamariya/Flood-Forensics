"""Recommendation endpoints (Phase 3) — returns demo data."""

from fastapi import APIRouter

from app.services.demo_data import RECOMMENDATIONS, get_recommendations_for_event

router = APIRouter(prefix="/recommendations")


@router.get("")
async def list_recommendations(event_id: str | None = None) -> list[dict]:
    """List permanent fix recommendations."""
    if event_id:
        return get_recommendations_for_event(event_id)
    return RECOMMENDATIONS
