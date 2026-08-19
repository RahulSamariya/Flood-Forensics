"""Recurrence agent — Flood DNA profile and similar event search (Phase 7).

Computes a Flood DNA profile for an event by analyzing historical events with
similar location, rainfall intensity, duration, water level, and drainage
conditions. Returns a similarity-ranked list of historical events plus the
aggregated recurrence profile.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Drain, FloodEvent, Rainfall, WaterLevel
from app.schemas import AgentStatus, FloodDNA, RecurrenceResponse
from app.services.ai_provider import AIProvider


class RecurrenceAgent:
    """Finds historical events with similar location, rainfall, and drainage conditions."""

    name = "recurrence"

    def __init__(self, ai: AIProvider) -> None:
        self._ai = ai

    async def analyze(self, event_id: str, session: AsyncSession) -> RecurrenceResponse:
        target = await session.get(FloodEvent, event_id)
        if not target:
            return RecurrenceResponse(
                event_id=event_id,
                status=AgentStatus.FAILED,
                flood_dna=None,
                similar_events=[],
                confidence=0.0,
            )

        # Load reference data once
        all_events = (
            (await session.execute(select(FloodEvent).order_by(FloodEvent.event_date))).scalars().all()
        )
        rainfall_rows = (
            (await session.execute(select(Rainfall))).scalars().all()
        )
        water_rows = (
            (await session.execute(select(WaterLevel))).scalars().all()
        )
        drains = (
            (await session.execute(select(Drain))).scalars().all()
        )

        target_rain = max((r.rainfall_intensity_mm_hr for r in rainfall_rows), default=0.0)
        target_peak_water = max((w.water_level_m for w in water_rows), default=0.0)
        target_duration = target.duration_minutes or 0

        similar: list[dict] = []
        for other in all_events:
            if other.event_id == event_id:
                continue

            score = 0.0
            factors: list[str] = []

            # Location proximity (same zone)
            if other.zone_id and other.zone_id == target.zone_id:
                score += 0.35
                factors.append("same zone")

            # Rainfall intensity similarity
            if abs((other.water_depth_cm or 0) - (target.water_depth_cm or 0)) <= 15:
                score += 0.2
                factors.append("similar depth")

            # Duration similarity
            other_duration = other.duration_minutes or 0
            if other_duration and target_duration:
                if abs(other_duration - target_duration) <= 45:
                    score += 0.15
                    factors.append("similar duration")

            # Severity similarity
            if other.severity == target.severity:
                score += 0.15
                factors.append("same severity")

            # Historical window weight
            years_apart = abs((other.event_date.year - target.event_date.year))
            if years_apart <= 1:
                score += 0.05

            similar.append(
                {
                    "event_id": other.event_id,
                    "event_date": other.event_date,
                    "severity": other.severity,
                    "water_depth_cm": other.water_depth_cm,
                    "similarity_score": round(score, 3),
                    "shared_factors": factors,
                }
            )

        similar.sort(key=lambda s: s["similarity_score"], reverse=True)
        similar = similar[:5]

        # ------------------------------------------------------------------
        # Flood DNA profile
        # ------------------------------------------------------------------
        zone_events = [e for e in all_events if e.zone_id and e.zone_id == target.zone_id]
        common_causes: list[str] = []
        blocked = [d for d in drains if (d.blockage_percent or 0) >= 50]
        if blocked:
            common_causes.append("drainage_blockage")
        if target_rain >= 60:
            common_causes.append("excessive_rainfall")
        if not common_causes:
            common_causes.append("insufficient_evidence")

        vulnerable = [d.drain_id for d in drains if (d.condition_score or 0) <= 4]
        vulnerable += [d.drain_id for d in drains if (d.blockage_percent or 0) >= 50]

        avg_recovery = None
        recoveries = [e.duration_minutes for e in zone_events if e.duration_minutes]
        if recoveries:
            avg_recovery = round(sum(recoveries) / len(recoveries))

        flood_dna = FloodDNA(
            rainfall_threshold_mm=round(target_rain, 1),
            critical_duration_minutes=target_duration,
            common_causes=common_causes,
            recurrence_count=len(zone_events),
            average_recovery_minutes=avg_recovery,
            vulnerable_infrastructure=vulnerable,
        )

        confidence = round(min(0.9, 0.4 + 0.1 * len(similar)), 2)

        return RecurrenceResponse(
            event_id=event_id,
            status=AgentStatus.COMPLETED,
            flood_dna=flood_dna,
            similar_events=similar,
            confidence=confidence,
        )