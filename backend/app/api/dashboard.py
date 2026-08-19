"""Dashboard aggregate endpoints (Phase 3/4)."""

from fastapi import APIRouter

from app.services.demo_data import (
    FLOOD_EVENTS,
    DRAINS,
    RAINFALL,
    WATER_LEVELS,
    RECOMMENDATIONS,
    DAMAGE_REPORTS,
    CITIZEN_REPORTS,
    get_rainfall_for_event,
    get_water_levels_for_event,
    get_citizen_reports_for_event,
    get_response_actions_for_event,
    get_damage_reports_for_event,
)

router = APIRouter()


@router.get("/dashboard/stats")
async def dashboard_stats() -> dict:
    """Aggregated stats for the dashboard header."""
    active = [e for e in FLOOD_EVENTS if e.get("severity") in ("critical", "high")]
    critical_drains = [d for d in DRAINS if (d.get("blockage_percent") or 0) > 50]
    total_damage = sum(d.get("estimated_cost", 0) or 0 for d in DAMAGE_REPORTS)

    # Simple resilience score: 100 minus penalty for blocked drains and recurring events
    avg_blockage = sum(d.get("blockage_percent", 0) or 0 for d in DRAINS) / max(len(DRAINS), 1)
    resilience = max(0, round(100 - avg_blockage - len(FLOOD_EVENTS) * 5))

    return {
        "active_incidents": len(active),
        "total_events": len(FLOOD_EVENTS),
        "critical_zones": len(critical_drains),
        "resilience_score": resilience,
        "recurring_hotspots": len(FLOOD_EVENTS),
        "total_damage_cost": total_damage,
        "total_recommendations": len(RECOMMENDATIONS),
        "total_citizen_reports": len(CITIZEN_REPORTS),
    }


@router.get("/rainfall")
async def list_rainfall(station_id: str | None = None) -> list[dict]:
    """List rainfall readings."""
    if station_id:
        return [r for r in RAINFALL if r.get("station_id") == station_id]
    return RAINFALL


@router.get("/water-levels")
async def list_water_levels(station_id: str | None = None) -> list[dict]:
    """List water-level readings."""
    if station_id:
        return [wl for wl in WATER_LEVELS if wl.get("station_id") == station_id]
    return WATER_LEVELS


@router.get("/citizen-reports")
async def list_citizen_reports(event_id: str | None = None) -> list[dict]:
    """List citizen reports."""
    if event_id:
        return get_citizen_reports_for_event(event_id)
    return CITIZEN_REPORTS


@router.get("/response-actions")
async def list_response_actions(event_id: str | None = None) -> list[dict]:
    """List response actions."""
    if event_id:
        return get_response_actions_for_event(event_id)
    from app.services.demo_data import RESPONSE_ACTIONS
    return RESPONSE_ACTIONS


@router.get("/damage-reports")
async def list_damage_reports(event_id: str | None = None) -> list[dict]:
    """List damage reports."""
    if event_id:
        return get_damage_reports_for_event(event_id)
    return DAMAGE_REPORTS
