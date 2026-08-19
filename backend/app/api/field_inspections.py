"""Field inspection endpoints (Phase 9)."""

from fastapi import APIRouter, status

from app.schemas import FieldInspectionCreate

router = APIRouter(prefix="/field-inspections")


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_field_inspection(body: FieldInspectionCreate) -> dict:
    """Create a field inspection record. Persisted in Phase 9."""
    return {
        "inspection_id": "pending",
        "message": "Field inspection endpoint stub — persistence in Phase 9.",
        "payload": body.model_dump(),
    }
