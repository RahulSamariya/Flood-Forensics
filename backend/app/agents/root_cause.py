"""Root Cause agent — ranked causal analysis with evidence (Phase 6)."""

from app.schemas import AgentStatus, RootCauseResponse
from app.services.ai_provider import AIProvider


class RootCauseAgent:
    """Investigates drainage blockage, capacity, rainfall, and maintenance failures."""

    name = "root_cause"

    def __init__(self, ai: AIProvider) -> None:
        self._ai = ai

    async def analyze(self, event_id: str) -> RootCauseResponse:
        return RootCauseResponse(
            event_id=event_id,
            status=AgentStatus.PENDING,
            ranked_causes=[],
            confidence=0.0,
        )
