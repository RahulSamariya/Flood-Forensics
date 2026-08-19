"""Drain network endpoints (Phase 3) — returns demo data."""

from fastapi import APIRouter

from app.services.demo_data import DRAINS

router = APIRouter(prefix="/drains")


@router.get("")
async def list_drains() -> list[dict]:
    """List all drainage network nodes."""
    return DRAINS
