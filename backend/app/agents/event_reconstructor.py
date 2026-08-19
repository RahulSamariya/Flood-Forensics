"""Event Reconstructor agent — rebuilds flood timeline from multi-source evidence (Phase 5)."""

from app.schemas import AgentStatus, ReconstructResponse
from app.services.ai_provider import AIProvider


class EventReconstructor:
    """Reconstructs flood event timeline from rainfall, water levels, reports, and response actions."""

    name = "event_reconstructor"

    def __init__(self, ai: AIProvider) -> None:
        self._ai = ai

    async def reconstruct(self, event_id: str) -> ReconstructResponse:
        # Phase 5: load event data from DB and build timeline
        return ReconstructResponse(
            event_id=event_id,
            status=AgentStatus.PENDING,
            timeline=[],
            affected_locations=[],
            severity=None,
            evidence=[],
            confidence=0.0,
        )
