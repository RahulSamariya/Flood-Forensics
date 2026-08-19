"""Field inspection endpoints (Phase 3/9)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import FieldInspection
from app.schemas import FieldInspectionCreate, FieldInspectionSchema

router = APIRouter(prefix="/field-inspections")


def _next_inspection_id(existing: list[str]) -> str:
    if not existing:
        return "I-0001"
    numbers = [int(rid.split("-")[1]) for rid in existing]
    return f"I-{max(numbers) + 1:04d}"


@router.get("", response_model=list[FieldInspectionSchema])
async def list_field_inspections(
    session: AsyncSession = Depends(get_db),
) -> list[FieldInspectionSchema]:
    """List field inspections."""
    result = await session.execute(select(FieldInspection).order_by(FieldInspection.timestamp))
    return [FieldInspectionSchema.model_validate(i, from_attributes=True) for i in result.scalars().all()]


@router.post("", response_model=FieldInspectionSchema, status_code=status.HTTP_201_CREATED)
async def create_field_inspection(
    body: FieldInspectionCreate,
    session: AsyncSession = Depends(get_db),
) -> FieldInspectionSchema:
    """Create a field inspection record."""
    result = await session.execute(select(FieldInspection.inspection_id))
    existing = list(result.scalars().all())
    inspection = FieldInspection(
        inspection_id=_next_inspection_id(existing),
        work_id=body.work_id,
        drain_id=body.drain_id,
        inspector_id=body.inspector_id,
        latitude=body.latitude,
        longitude=body.longitude,
        image_before=body.image_before,
        image_after=body.image_after,
        blockage_before=body.blockage_before,
        blockage_after=body.blockage_after,
        notes=body.notes or "",
        verification_status="pending",
    )
    session.add(inspection)
    await session.commit()
    await session.refresh(inspection)
    return FieldInspectionSchema.model_validate(inspection, from_attributes=True)


@router.get("/{inspection_id}", response_model=FieldInspectionSchema)
async def get_field_inspection(
    inspection_id: str,
    session: AsyncSession = Depends(get_db),
) -> FieldInspectionSchema:
    """Get a single field inspection."""
    inspection = await session.get(FieldInspection, inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail=f"Inspection {inspection_id} not found.")
    return FieldInspectionSchema.model_validate(inspection, from_attributes=True)