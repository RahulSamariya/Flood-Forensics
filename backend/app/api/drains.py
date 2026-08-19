"""Drain network endpoints (Phase 3)."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Drain
from app.schemas import DrainSchema

router = APIRouter(prefix="/drains")


@router.get("", response_model=list[DrainSchema])
async def list_drains(
    session: AsyncSession = Depends(get_db),
    min_blockage: float | None = None,
) -> list[DrainSchema]:
    """List drainage network nodes, optionally filtering by blockage."""
    query = select(Drain).order_by(Drain.drain_id)
    if min_blockage is not None:
        query = query.where(Drain.blockage_percent >= min_blockage)
    result = await session.execute(query)
    return [DrainSchema.model_validate(d, from_attributes=True) for d in result.scalars().all()]