"""Evidence helpers — agents must attach source-backed evidence to findings."""

from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    source: str = Field(..., description="Data source table or sensor ID")
    reference: str = Field(..., description="Record ID or timestamp reference")
    description: str
    value: str | float | int | None = None


def build_evidence(
    source: str,
    reference: str,
    description: str,
    value: str | float | int | None = None,
) -> EvidenceItem:
    return EvidenceItem(
        source=source,
        reference=reference,
        description=description,
        value=value,
    )
