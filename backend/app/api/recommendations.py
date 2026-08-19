"""Recommendation endpoints (Phase 3/8)."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Recommendation
from app.schemas import RecommendationSchema

router = APIRouter(prefix="/recommendations")


@router.get("", response_model=list[RecommendationSchema])
async def list_recommendations(
    event_id: str | None = None,
    session: AsyncSession = Depends(get_db),
) -> list[RecommendationSchema]:
    """List permanent fix recommendations, optionally filtered by event."""
    query = select(Recommendation).order_by(Recommendation.priority, Recommendation.id)
    if event_id:
        query = query.where(Recommendation.event_id == event_id)
    result = await session.execute(query)
    return [RecommendationSchema.model_validate(r, from_attributes=True) for r in result.scalars().all()]