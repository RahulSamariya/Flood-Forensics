"""Urban Resilience Commander — orchestrates agents and NL queries (Phase 10)."""

from app.agents.event_reconstructor import EventReconstructor
from app.agents.field_verification import FieldVerificationAgent
from app.agents.permanent_fix import PermanentFixAgent
from app.agents.recurrence import RecurrenceAgent
from app.agents.root_cause import RootCauseAgent
from app.schemas import AgentStatus, CommanderAnalyzeResponse
from app.services.ai_provider import AIProvider, get_ai_provider


class UrbanResilienceCommander:
    """
    Orchestrates specialized agents.
    Does NOT invent facts — aggregates evidence-backed findings only.
    """

    name = "commander"

    def __init__(self, ai: AIProvider | None = None) -> None:
        self._ai = ai or get_ai_provider()
        self._reconstructor = EventReconstructor(self._ai)
        self._root_cause = RootCauseAgent(self._ai)
        self._recurrence = RecurrenceAgent(self._ai)
        self._permanent_fix = PermanentFixAgent(self._ai)
        self._field_verification = FieldVerificationAgent(self._ai)

    async def analyze(
        self,
        event_id: str | None = None,
        query: str | None = None,
    ) -> CommanderAnalyzeResponse:
        if query and not event_id:
            return CommanderAnalyzeResponse(
                status=AgentStatus.PENDING,
                incident_brief=f"Natural-language query received: '{query}'. Full NL interface in Phase 10.",
                confidence=0.0,
            )

        if not event_id:
            return CommanderAnalyzeResponse(
                status=AgentStatus.FAILED,
                incident_brief="Insufficient evidence. Provide event_id or query.",
                confidence=0.0,
            )

        return CommanderAnalyzeResponse(
            status=AgentStatus.PENDING,
            incident_brief=f"Commander analysis for {event_id} — pipeline pending Phase 10 implementation.",
            confidence=0.0,
            agent_findings=[],
        )
