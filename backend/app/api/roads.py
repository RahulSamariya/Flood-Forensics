"""Road network endpoints (Phase 3)."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Road
from app.schemas import RoadSchema

router = APIRouter(prefix="/roads")


@router.get("", response_model=list[RoadSchema])
async def list_roads(
    session: AsyncSession = Depends(get_db),
    critical_only: bool = False,
) -> list[RoadSchema]:
    """List road network."""
    query = select(Road).order_by(Road.road_id)
    if critical_only:
        query = query.where(Road.criticality == "critical")
    result = await session.execute(query)
    return [RoadSchema.model_validate(r, from_attributes=True) for r in result.scalars().all()]