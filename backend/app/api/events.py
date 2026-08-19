"""Flood event endpoints (Phase 3)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.event_reconstructor import EventReconstructor
from app.core.database import get_db
from app.models import (
    CitizenReport,
    FloodEvent,
    Rainfall,
    ResponseAction,
    WaterLevel,
)
from app.schemas import (
    CitizenReportSchema,
    FloodEventDetail,
    FloodEventSummary,
    RainfallReading,
    ReconstructRequest,
    ReconstructResponse,
    ResponseActionSchema,
    WaterLevelReading,
)
from app.services.ai_provider import get_ai_provider

router = APIRouter(prefix="/events")


def _summary(event: FloodEvent) -> FloodEventSummary:
    return FloodEventSummary(
        event_id=event.event_id,
        event_date=event.event_date,
        city=event.city,
        zone_id=event.zone_id,
        latitude=event.latitude,
        longitude=event.longitude,
        severity=event.severity,
        water_depth_cm=event.water_depth_cm,
        source=event.source,
    )


@router.get("", response_model=list[FloodEventSummary])
async def list_events(session: AsyncSession = Depends(get_db)) -> list[FloodEventSummary]:
    """List flood events."""
    result = await session.execute(select(FloodEvent).order_by(FloodEvent.event_date.desc()))
    events = result.scalars().all()
    return [_summary(event) for event in events]


@router.get("/{event_id}/rainfall", response_model=list[RainfallReading])
async def get_event_rainfall(
    event_id: str,
    session: AsyncSession = Depends(get_db),
) -> list[RainfallReading]:
    """Rainfall readings near an event's station."""
    event = await session.get(FloodEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found.")
    result = await session.execute(
        select(Rainfall).order_by(Rainfall.timestamp)
    )
    return [RainfallReading.model_validate(r, from_attributes=True) for r in result.scalars().all()]


@router.get("/{event_id}/water-levels", response_model=list[WaterLevelReading])
async def get_event_water_levels(
    event_id: str,
    session: AsyncSession = Depends(get_db),
) -> list[WaterLevelReading]:
    """Water level readings near an event's station."""
    event = await session.get(FloodEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found.")
    result = await session.execute(select(WaterLevel).order_by(WaterLevel.timestamp))
    return [WaterLevelReading.model_validate(r, from_attributes=True) for r in result.scalars().all()]


@router.get("/{event_id}/reports", response_model=list[CitizenReportSchema])
async def get_event_reports(
    event_id: str,
    session: AsyncSession = Depends(get_db),
) -> list[CitizenReportSchema]:
    """Citizen reports linked to an event."""
    event = await session.get(FloodEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found.")
    result = await session.execute(
        select(CitizenReport)
        .where(CitizenReport.event_id == event_id)
        .order_by(CitizenReport.timestamp)
    )
    return [CitizenReportSchema.model_validate(r, from_attributes=True) for r in result.scalars().all()]


@router.get("/{event_id}/response-actions", response_model=list[ResponseActionSchema])
async def get_event_response_actions(
    event_id: str,
    session: AsyncSession = Depends(get_db),
) -> list[ResponseActionSchema]:
    """Response actions taken during an event."""
    event = await session.get(FloodEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found.")
    result = await session.execute(
        select(ResponseAction)
        .where(ResponseAction.event_id == event_id)
        .order_by(ResponseAction.timestamp)
    )
    return [ResponseActionSchema.model_validate(r, from_attributes=True) for r in result.scalars().all()]


@router.get("/{event_id}", response_model=FloodEventDetail)
async def get_event(
    event_id: str,
    session: AsyncSession = Depends(get_db),
) -> FloodEventDetail:
    """Get flood event by ID."""
    event = await session.get(FloodEvent, event_id)
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found.")
    return FloodEventDetail(
        **_summary(event).model_dump(),
        end_date=event.end_date,
        duration_minutes=event.duration_minutes,
        affected_area_km2=event.affected_area_km2,
        affected_population=event.affected_population,
        confidence=event.confidence,
    )


@router.post("/{event_id}/reconstruct", response_model=ReconstructResponse)
async def reconstruct_event(
    event_id: str,
    body: ReconstructRequest | None = None,
    session: AsyncSession = Depends(get_db),
) -> ReconstructResponse:
    """Run Event Reconstructor agent (Phase 5)."""
    _ = body
    agent = EventReconstructor(get_ai_provider())
    return await agent.reconstruct(event_id, session)