"""Permanent Fix agent — intervention recommendations (Phase 8)."""

from app.schemas import AgentStatus, PermanentFixResponse
from app.services.ai_provider import AIProvider


class PermanentFixAgent:
    """Generates immediate response and permanent intervention options."""

    name = "permanent_fix"

    def __init__(self, ai: AIProvider) -> None:
        self._ai = ai

    async def analyze(self, event_id: str) -> PermanentFixResponse:
        return PermanentFixResponse(
            event_id=event_id,
            status=AgentStatus.PENDING,
            immediate_response=[],
            permanent_interventions=[],
            confidence=0.0,
        )
