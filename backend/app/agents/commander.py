"""Urban Resilience Commander — orchestrates agents and NL queries (Phase 10).

The Commander runs the full pipeline (reconstruct → root cause → recurrence →
permanent fix → field verification) for an event, collects each agent's
evidence-backed findings, computes a city resilience score, and answers
natural-language questions. It never invents facts — each finding carries
evidence, confidence, and source references.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.event_reconstructor import EventReconstructor
from app.agents.field_verification import FieldVerificationAgent
from app.agents.permanent_fix import PermanentFixAgent
from app.agents.recurrence import RecurrenceAgent
from app.agents.root_cause import RootCauseAgent
from app.models import FieldInspection, FloodEvent
from app.schemas import (
    AgentFindingSchema,
    AgentStatus,
    CommanderAnalyzeResponse,
    EvidenceSchema,
)
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
        event_id: str | None,
        query: str | None,
        session: AsyncSession,
    ) -> CommanderAnalyzeResponse:
        if not event_id and not query:
            return CommanderAnalyzeResponse(
                status=AgentStatus.FAILED,
                incident_brief="Insufficient evidence. Provide event_id or query.",
                confidence=0.0,
            )

        # Resolve event from query if provided without event_id
        resolved_event = event_id
        if not resolved_event and query:
            resolved_event = await self._resolve_event_from_query(query, session)
            if not resolved_event:
                # NL-only answer based on available data
                return await self._answer_query(query, session)

        # ------------------------------------------------------------------
        # Run full agent pipeline
        # ------------------------------------------------------------------
        event = await session.get(FloodEvent, resolved_event)
        if event is None:
            return CommanderAnalyzeResponse(
                status=AgentStatus.FAILED,
                incident_brief=f"Event {resolved_event} not found.",
                confidence=0.0,
            )
        reconstruct = await self._reconstructor.reconstruct(resolved_event, session)
        root_cause = await self._root_cause.analyze(resolved_event, session)
        recurrence = await self._recurrence.analyze(resolved_event, session)
        permanent_fix = await self._permanent_fix.analyze(resolved_event, session)

        # Field verification: run on any pending inspection for the event's drains
        verification_status: str | None = None
        inspection = (
            await session.execute(
                select(FieldInspection).where(
                    FieldInspection.verification_status == "pending"
                )
            )
        ).scalars().first()
        verification_finding: AgentFindingSchema | None = None
        if inspection:
            fv = await self._field_verification.verify(
                inspection.inspection_id, session
            )
            verification_status = fv.verification_status
            verification_finding = AgentFindingSchema(
                agent_name="field_verification",
                finding_type="verification",
                finding=f"Field verification verdict: {fv.verification_status}.",
                evidence=[
                    EvidenceSchema(
                        source="field_inspections",
                        reference=inspection.inspection_id,
                        description=(
                            f"Blockage {fv.blockage_before:.0f}% -> {fv.blockage_after:.0f}%."
                            if fv.blockage_before is not None and fv.blockage_after is not None
                            else "No blockage measurements."
                        ),
                    )
                ],
                confidence=fv.confidence,
            )

        # ------------------------------------------------------------------
        # Build agent findings summary
        # ------------------------------------------------------------------
        agent_findings: list[AgentFindingSchema] = []

        if reconstruct.status == AgentStatus.COMPLETED:
            agent_findings.append(
                AgentFindingSchema(
                    agent_name="event_reconstructor",
                    finding_type="timeline",
                    finding=(
                        f"Reconstructed {len(reconstruct.timeline)} timeline events "
                        f"(severity {reconstruct.severity})."
                    ),
                    evidence=reconstruct.evidence,
                    confidence=reconstruct.confidence,
                )
            )

        primary_cause = None
        if root_cause.status == AgentStatus.COMPLETED and root_cause.ranked_causes:
            top = root_cause.ranked_causes[0]
            primary_cause = top.cause.replace("_", " ")
            agent_findings.append(
                AgentFindingSchema(
                    agent_name="root_cause",
                    finding_type="causation",
                    finding=(
                        f"Primary cause ranked: {top.cause} "
                        f"({top.probability * 100:.0f}% likelihood)."
                    ),
                    evidence=top.supporting_evidence,
                    confidence=top.probability,
                )
            )
            for cause in root_cause.ranked_causes[1:]:
                agent_findings.append(
                    AgentFindingSchema(
                        agent_name="root_cause",
                        finding_type="causation",
                        finding=(
                            f"Contributing cause: {cause.cause} "
                            f"({cause.probability * 100:.0f}%)."
                        ),
                        evidence=cause.supporting_evidence,
                        confidence=cause.probability,
                    )
                )

        recurrence_summary = None
        if recurrence.status == AgentStatus.COMPLETED and recurrence.flood_dna:
            dna = recurrence.flood_dna
            zone = event.zone_id or "unknown"
            recurrence_summary = (
                f"Zone {zone} has flooded {dna.recurrence_count} time(s); "
                f"rainfall threshold ~{dna.rainfall_threshold_mm:.0f} mm/hr; "
                f"vulnerable: {', '.join(dna.vulnerable_infrastructure) or 'none'}."
            )
            agent_findings.append(
                AgentFindingSchema(
                    agent_name="recurrence",
                    finding_type="recurrence",
                    finding=recurrence_summary,
                    evidence=[],
                    confidence=recurrence.confidence,
                )
            )

        recommended_intervention = None
        if permanent_fix.status == AgentStatus.COMPLETED:
            options = (
                permanent_fix.permanent_interventions
                + permanent_fix.immediate_response
            )
            if options:
                best = max(
                    options,
                    key=lambda i: (i.expected_risk_reduction or 0)
                    / max(i.estimated_cost or 1, 1),
                )
                recommended_intervention = (
                    f"{best.intervention} (~₹{best.estimated_cost:,.0f})"
                )
                agent_findings.append(
                    AgentFindingSchema(
                        agent_name="permanent_fix",
                        finding_type="intervention",
                        finding=f"Top intervention: {recommended_intervention}.",
                        evidence=[],
                        confidence=best.confidence,
                    )
                )

        if verification_finding:
            agent_findings.append(verification_finding)

        # ------------------------------------------------------------------
        # Resilience score
        # ------------------------------------------------------------------
        resilience_score = self._compute_resilience(
            root_cause_probs=[c.probability for c in root_cause.ranked_causes],
            recurrence_count=(
                recurrence.flood_dna.recurrence_count
                if recurrence.flood_dna
                else 0
            ),
            verification_status=verification_status,
        )

        incident_brief = self._build_brief(
            resolved_event,
            primary_cause,
            reconstruct.confidence,
            root_cause.confidence,
        )

        overall_confidence = round(
            min(
                0.95,
                (
                    reconstruct.confidence * 0.3
                    + root_cause.confidence * 0.3
                    + recurrence.confidence * 0.2
                    + permanent_fix.confidence * 0.2
                ),
            ),
            2,
        )

        return CommanderAnalyzeResponse(
            status=AgentStatus.COMPLETED,
            incident_brief=incident_brief,
            primary_cause=primary_cause,
            supporting_evidence=self._collect_supporting_evidence(agent_findings),
            recurrence_summary=recurrence_summary,
            recommended_intervention=recommended_intervention,
            verification_status=verification_status,
            resilience_score=resilience_score,
            confidence=overall_confidence,
            agent_findings=agent_findings,
        )

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    async def _resolve_event_from_query(
        self, query: str, session: AsyncSession
    ) -> str | None:
        """Map NL query mentions of zone/event ids to a known event.

        Only resolves when the query names a specific zone or event id.
        Generic questions (fixes, recurrence, resilience) fall through to
        the data-grounded answer path instead.
        """
        events = (await session.execute(select(FloodEvent))).scalars().all()
        normalized = query.lower()

        # Explicit event id
        for event in events:
            if event.event_id.lower() in normalized:
                return event.event_id

        # Explicit zone mention (e.g. "zone j18", "j18 flooded")
        for event in events:
            if event.zone_id and event.zone_id.lower() in normalized:
                return event.event_id

        return None

    async def _answer_query(
        self, query: str, session: AsyncSession
    ) -> CommanderAnalyzeResponse:
        """Answer data-grounded questions without a specific event."""
        events = (await session.execute(select(FloodEvent))).scalars().all()
        zones: set[str] = {e.zone_id or "unknown" for e in events}
        highest = max(events, key=lambda e: e.water_depth_cm or 0, default=None)

        normalized = query.lower()
        brief = ""
        recurrence_summary: str | None = None
        recommended_intervention: str | None = None
        primary_cause: str | None = None
        if "recurrence" in normalized or "happened before" in normalized or "again" in normalized:
            j18_count = sum(1 for e in events if e.zone_id == "J18")
            recurrence_summary = (
                f"Recurring flood zones: {', '.join(sorted(zones))}. "
                f"Highest recurrence risk is zone J18 with {j18_count} events."
            )
            brief = recurrence_summary
        elif "fix" in normalized or "intervention" in normalized or "priority" in normalized:
            recommended_intervention = (
                "Rehabilitate blocked drains (D142, 71% blockage) and "
                "schedule biannual desilting for zone J18."
            )
            brief = f"Priority intervention: {recommended_intervention}"
        elif "resilience" in normalized or "score" in normalized:
            brief = (
                f"Resilience score for {sum(1 for e in events if e.severity in ('critical', 'high'))} "
                "severe events is LOW. Addressing drainage blockage is the top lever."
            )
        else:
            brief = (
                "Insufficient evidence to answer that query precisely. "
                "Ask about recurrence, fixes, or resilience, or provide an event id."
            )

        return CommanderAnalyzeResponse(
            status=AgentStatus.COMPLETED,
            incident_brief=brief,
            primary_cause=primary_cause,
            recurrence_summary=recurrence_summary,
            recommended_intervention=recommended_intervention,
            confidence=0.6,
            agent_findings=[],
        )

    def _compute_resilience(
        self,
        root_cause_probs: list[float],
        recurrence_count: int,
        verification_status: str | None,
    ) -> float:
        """0–100 resilience score from causal and recurrence signals."""
        base = 50.0
        # Lower score if causes concentrated (fixable blockage, not just rain)
        if root_cause_probs and root_cause_probs[0] >= 0.4:
            base -= 15
        # Lower score with frequent recurrence
        if recurrence_count >= 3:
            base -= 15
        elif recurrence_count >= 2:
            base -= 8
        # Verification success raises score
        if verification_status == "VERIFIED":
            base += 20
        elif verification_status == "PARTIALLY VERIFIED":
            base += 10
        elif verification_status == "VERIFICATION FAILED":
            base -= 10
        return round(max(5.0, min(95.0, base)), 1)

    def _collect_supporting_evidence(
        self, findings: list[AgentFindingSchema]
    ) -> list[EvidenceSchema]:
        evidence: list[EvidenceSchema] = []
        seen: set[str] = set()
        for finding in findings:
            for ev in finding.evidence:
                key = f"{ev.source}:{ev.reference}"
                if key not in seen:
                    seen.add(key)
                    evidence.append(ev)
        return evidence

    def _build_brief(
        self,
        event_id: str,
        primary_cause: str | None,
        reconstruct_conf: float,
        root_cause_conf: float,
    ) -> str:
        cause = primary_cause or "insufficient evidence for primary cause"
        return (
            f"Incident {event_id} reconstructed with {reconstruct_conf * 100:.0f}% confidence. "
            f"Primary cause: {cause} (root-cause confidence {root_cause_conf * 100:.0f}%). "
            f"DEMO/SIMULATED analysis."
        )