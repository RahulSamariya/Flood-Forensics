"""Flood event endpoints (Phase 3) — returns demo data."""

from fastapi import APIRouter, HTTPException

from app.agents.event_reconstructor import EventReconstructor
from app.schemas import (
    FloodEventDetail,
    FloodEventSummary,
    ReconstructRequest,
    ReconstructResponse,
)
from app.services.ai_provider import get_ai_provider
from app.services.demo_data import FLOOD_EVENTS, get_event

router = APIRouter(prefix="/events")


@router.get("", response_model=list[FloodEventSummary])
async def list_events() -> list[FloodEventSummary]:
    # Trigger uvicorn reload
    """List all flood events."""
    return [
        FloodEventSummary(
            event_id=e["event_id"],
            event_date=e["event_date"],
            city=e["city"],
            zone_id=e.get("zone_id"),
            latitude=e["latitude"],
            longitude=e["longitude"],
            severity=e["severity"],
            water_depth_cm=e.get("water_depth_cm"),
            source=e.get("source", "DEMO"),
        )
        for e in FLOOD_EVENTS
    ]


@router.get("/{event_id}", response_model=FloodEventDetail)
async def get_event_detail(event_id: str) -> FloodEventDetail:
    """Get flood event by ID."""
    event = get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found.")
    return FloodEventDetail(
        event_id=event["event_id"],
        event_date=event["event_date"],
        city=event["city"],
        zone_id=event.get("zone_id"),
        latitude=event["latitude"],
        longitude=event["longitude"],
        severity=event["severity"],
        water_depth_cm=event.get("water_depth_cm"),
        source=event.get("source", "DEMO"),
        end_date=event.get("end_date"),
        duration_minutes=event.get("duration_minutes"),
        affected_area_km2=event.get("affected_area_km2"),
        affected_population=event.get("affected_population"),
        confidence=event.get("confidence"),
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
