"""HTTP API route handlers."""

from fastapi import APIRouter

from app.api import agents, commander, dashboard, drains, events, field_inspections, recommendations, roads

api_router = APIRouter(prefix="/api")

api_router.include_router(events.router, tags=["events"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(commander.router, prefix="/commander", tags=["commander"])
api_router.include_router(drains.router, tags=["drains"])
api_router.include_router(roads.router, tags=["roads"])
api_router.include_router(recommendations.router, tags=["recommendations"])
api_router.include_router(field_inspections.router, tags=["field-inspections"])
api_router.include_router(dashboard.router, tags=["dashboard"])
