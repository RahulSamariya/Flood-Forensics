"""Permanent Fix agent — intervention recommendations (Phase 8).

Separates immediate response from permanent interventions, grounded in
observed data (blocked drains, capacity deficits, peak water levels).
Each recommendation carries estimated cost, expected risk reduction,
implementation time, priority, and confidence.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Drain, FloodEvent, Rainfall, WaterLevel
from app.schemas import AgentStatus, Intervention, PermanentFixResponse
from app.services.ai_provider import AIProvider


class PermanentFixAgent:
    """Generates immediate response and permanent intervention options."""

    name = "permanent_fix"

    def __init__(self, ai: AIProvider) -> None:
        self._ai = ai

    async def analyze(self, event_id: str, session: AsyncSession) -> PermanentFixResponse:
        event = await session.get(FloodEvent, event_id)
        if not event:
            return PermanentFixResponse(
                event_id=event_id,
                status=AgentStatus.FAILED,
                immediate_response=[],
                permanent_interventions=[],
                confidence=0.0,
            )

        drains = (
            (await session.execute(select(Drain).order_by(Drain.drain_id))).scalars().all()
        )
        rainfall_rows = (
            (await session.execute(select(Rainfall))).scalars().all()
        )
        water_rows = (
            (await session.execute(select(WaterLevel))).scalars().all()
        )

        peak_intensity = max((r.rainfall_intensity_mm_hr for r in rainfall_rows), default=0.0)
        peak_water = max((w.water_level_m for w in water_rows), default=0.0)
        blocked = [d for d in drains if (d.blockage_percent or 0) >= 50]
        lowest = min(drains, key=lambda d: d.condition_score, default=None)

        immediate: list[Intervention] = []
        permanent: list[Intervention] = []

        # ------------------------------------------------------------------
        # IMMEDIATE RESPONSE
        # ------------------------------------------------------------------
        if blocked:
            immediate.append(
                Intervention(
                    intervention=(
                        f"Emergency desilting and jetting of {', '.join(d.drain_id for d in blocked)}"
                    ),
                    intervention_type="immediate",
                    estimated_cost=round(sum(d.length_m or 0 for d in blocked) * 120),
                    expected_risk_reduction=0.35,
                    implementation_time_days=2,
                    priority="high",
                    confidence=0.85,
                )
            )
        immediate.append(
            Intervention(
                intervention="Deploy mobile pumping to J18 Market Road during storm events",
                intervention_type="immediate",
                estimated_cost=45000,
                expected_risk_reduction=0.2,
                implementation_time_days=1,
                priority="high",
                confidence=0.7,
            )
        )

        # ------------------------------------------------------------------
        # PERMANENT INTERVENTIONS
        # ------------------------------------------------------------------
        # 1. Rehabilitate blocked/low-condition drains
        if lowest and blocked:
            permanent.append(
                Intervention(
                    intervention=(
                        f"Rehabilitate {lowest.drain_id} and {', '.join(d.drain_id for d in blocked[1:])}"
                        if len(blocked) > 1
                        else f"Rehabilitate {lowest.drain_id}"
                    ),
                    intervention_type="permanent",
                    estimated_cost=round((lowest.length_m or 0) * 850),
                    expected_risk_reduction=0.55,
                    implementation_time_days=30,
                    priority="high",
                    confidence=0.8,
                )
            )

        # 2. Capacity upgrade for branch drain
        permanent.append(
            Intervention(
                intervention="Upsize J18 branch drain (600mm to 900mm) to meet peak inflow",
                intervention_type="permanent",
                estimated_cost=420000,
                expected_risk_reduction=0.35,
                implementation_time_days=120,
                priority="medium",
                confidence=0.6,
            )
        )

        # 3. Maintenance schedule / sensor program
        permanent.append(
            Intervention(
                intervention="Scheduled biannual desilting program for zone J18 drains",
                intervention_type="permanent",
                estimated_cost=120000,
                expected_risk_reduction=0.25,
                implementation_time_days=60,
                priority="medium",
                confidence=0.65,
            )
        )

        # 4. If rainfall is extreme, recommend infrastructure note
        if peak_intensity >= 60:
            permanent.append(
                Intervention(
                    intervention="Elevate J18 Market Road and install retention basin",
                    intervention_type="permanent",
                    estimated_cost=1800000,
                    expected_risk_reduction=0.15,
                    implementation_time_days=240,
                    priority="low",
                    confidence=0.4,
                )
            )

        # Cost-vs-impact ordering: sort permanent by risk reduction per cost
        def roi(intervention: Intervention) -> float:
            cost = intervention.estimated_cost or 1
            return (intervention.expected_risk_reduction or 0) / cost

        permanent.sort(key=roi, reverse=True)

        confidence = round(min(0.9, 0.4 + 0.1 * len(permanent)), 2)

        return PermanentFixResponse(
            event_id=event_id,
            status=AgentStatus.COMPLETED,
            immediate_response=immediate,
            permanent_interventions=permanent,
            confidence=confidence,
        )