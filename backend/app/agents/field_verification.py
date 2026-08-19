"""Field Verification agent — before/after inspection analysis (Phase 9)."""

from app.schemas import AgentStatus, FieldVerificationResponse
from app.services.ai_provider import AIProvider


class FieldVerificationAgent:
    """Analyzes inspection images and compares blockage/condition metrics."""

    name = "field_verification"

    def __init__(self, ai: AIProvider) -> None:
        self._ai = ai

    async def verify(self, inspection_id: str) -> FieldVerificationResponse:
        return FieldVerificationResponse(
            inspection_id=inspection_id,
            status=AgentStatus.PENDING,
            verification_status="PENDING",
            findings=[],
            confidence=0.0,
            allow_human_override=True,
        )
