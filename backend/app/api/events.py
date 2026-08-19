"""Flood event endpoints (Phase 3)."""

from fastapi import APIRouter, HTTPException

from app.agents.event_reconstructor import EventReconstructor
from app.schemas import (
    FloodEventDetail,
    FloodEventSummary,
    ReconstructRequest,
    ReconstructResponse,
)
from app.services.ai_provider import get_ai_provider

router = APIRouter(prefix="/events")


@router.get("", response_model=list[FloodEventSummary])
async def list_events() -> list[FloodEventSummary]:
    """List flood events. Returns empty until Phase 2 seed data is loaded."""
    return []


@router.get("/{event_id}", response_model=FloodEventDetail)
async def get_event(event_id: str) -> FloodEventDetail:
    """Get flood event by ID."""
    raise HTTPException(
        status_code=404,
        detail=f"Event {event_id} not found. Seed data available in Phase 2.",
    )


@router.post("/{event_id}/reconstruct", response_model=ReconstructResponse)
async def reconstruct_event(
    event_id: str,
    body: ReconstructRequest | None = None,
) -> ReconstructResponse:
    """Run Event Reconstructor agent (Phase 5)."""
    _ = body
    agent = EventReconstructor(get_ai_provider())
    return await agent.reconstruct(event_id)
