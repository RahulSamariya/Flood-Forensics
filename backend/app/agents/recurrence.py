"""Recurrence agent — Flood DNA and similar event search (Phase 7)."""

from app.schemas import AgentStatus, RecurrenceResponse
from app.services.ai_provider import AIProvider


class RecurrenceAgent:
    """Finds historical events with similar location, rainfall, and drainage conditions."""

    name = "recurrence"

    def __init__(self, ai: AIProvider) -> None:
        self._ai = ai

    async def analyze(self, event_id: str) -> RecurrenceResponse:
        return RecurrenceResponse(
            event_id=event_id,
            status=AgentStatus.PENDING,
            flood_dna=None,
            similar_events=[],
            confidence=0.0,
        )
