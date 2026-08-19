"""Drain network endpoints (Phase 3)."""

from fastapi import APIRouter

router = APIRouter(prefix="/drains")


@router.get("")
async def list_drains() -> list[dict]:
    """List drainage network nodes. Populated in Phase 2/3."""
    return []
