"""Event Reconstructor agent — rebuilds flood timeline from multi-source evidence (Phase 5).

The agent merges rainfall, water levels, citizen reports, and response actions
into a single reconstructed timeline, identifying affected locations and overall
event severity. Every timeline entry and finding is backed by source evidence.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    CitizenReport,
    FloodEvent,
    Rainfall,
    ResponseAction,
    WaterLevel,
)
from app.schemas import AgentStatus, EvidenceSchema, ReconstructResponse
from app.services.ai_provider import AIProvider
from app.utils.evidence import build_evidence


class EventReconstructor:
    """Reconstructs flood event timeline from rainfall, water levels, reports, and response actions."""

    name = "event_reconstructor"

    def __init__(self, ai: AIProvider) -> None:
        self._ai = ai

    async def reconstruct(
        self,
        event_id: str,
        session: AsyncSession,
    ) -> ReconstructResponse:
        event = await session.get(FloodEvent, event_id)
        if not event:
            return ReconstructResponse(
                event_id=event_id,
                status=AgentStatus.FAILED,
                timeline=[],
                affected_locations=[],
                severity=None,
                evidence=[],
                confidence=0.0,
            )

        rainfall = (
            (
                await session.execute(
                    select(Rainfall).order_by(Rainfall.timestamp)
                )
            )
            .scalars()
            .all()
        )
        water_levels = (
            (
                await session.execute(
                    select(WaterLevel).order_by(WaterLevel.timestamp)
                )
            )
            .scalars()
            .all()
        )
        reports = (
            (
                await session.execute(
                    select(CitizenReport)
                    .where(CitizenReport.event_id == event_id)
                    .order_by(CitizenReport.timestamp)
                )
            )
            .scalars()
            .all()
        )
        actions = (
            (
                await session.execute(
                    select(ResponseAction)
                    .where(ResponseAction.event_id == event_id)
                    .order_by(ResponseAction.timestamp)
                )
            )
            .scalars()
            .all()
        )

        timeline: list[dict] = []
        evidence: list[EvidenceSchema] = []

        # 1. Rainfall-derived timeline points
        for row in rainfall:
            timeline.append(
                {
                    "timestamp": row.timestamp,
                    "event": f"Rainfall {row.rainfall_mm:.0f} mm "
                    f"({row.rainfall_intensity_mm_hr:.0f} mm/hr) at {row.station_id}",
                    "source": "rainfall",
                    "severity": "info",
                }
            )
        evidence.append(
            EvidenceSchema(
                **build_evidence(
                    source="rainfall",
                    reference=f"{event_id}-rainfall",
                    description=(
                        f"Peak rainfall {max(r.rainfall_mm for r in rainfall):.0f} mm "
                        f"at intensity {max(r.rainfall_intensity_mm_hr for r in rainfall):.0f} mm/hr."
                    ),
                    value=max(r.rainfall_mm for r in rainfall),
                ).model_dump()
            )
        )

        # 2. Water level timeline points
        for row in water_levels:
            label = f"Water level {row.water_level_m:.2f}m at {row.station_id}"
            if row.water_level_m >= row.danger_level_m:
                label += " — danger level exceeded"
                sev = "critical"
            elif row.status == "warning":
                label += " — warning"
                sev = "warning"
            else:
                sev = "info"
            timeline.append(
                {
                    "timestamp": row.timestamp,
                    "event": label,
                    "source": "water_levels",
                    "severity": sev,
                }
            )
        peak_water = max(water_levels, key=lambda w: w.water_level_m)
        evidence.append(
            EvidenceSchema(
                **build_evidence(
                    source="water_levels",
                    reference=f"{event_id}-water-levels",
                    description=(
                        f"Peak water level {peak_water.water_level_m:.2f}m "
                        f"(danger {peak_water.danger_level_m:.2f}m) at {peak_water.timestamp}."
                    ),
                    value=peak_water.water_level_m,
                ).model_dump()
            )
        )

        # 3. Citizen reports
        for report in reports:
            timeline.append(
                {
                    "timestamp": report.timestamp,
                    "event": report.description,
                    "source": "citizen_report",
                    "severity": report.severity,
                    "report_id": report.report_id,
                }
            )
            evidence.append(
                EvidenceSchema(
                    **build_evidence(
                        source="citizen_reports",
                        reference=report.report_id,
                        description=report.description,
                        value=report.water_depth_cm,
                    ).model_dump()
                )
            )

        # 4. Response actions
        for action in actions:
            timeline.append(
                {
                    "timestamp": action.timestamp,
                    "event": (
                        f"{action.action_type.replace('_', ' ').title()} "
                        f"at {action.location or 'unknown'} by {action.team_id or 'team n/a'}"
                    ),
                    "source": "response_action",
                    "severity": "action",
                    "action_id": action.action_id,
                }
            )
            evidence.append(
                EvidenceSchema(
                    **build_evidence(
                        source="response_actions",
                        reference=action.action_id,
                        description=f"{action.action_type} at {action.location or 'unknown'}.",
                        value=action.effectiveness,
                    ).model_dump()
                )
            )

        timeline.sort(key=lambda t: t["timestamp"])

        affected_locations = []
        seen: set[tuple[float, float]] = set()
        for report in reports:
            key = (report.latitude, report.longitude)
            if key in seen:
                continue
            seen.add(key)
            affected_locations.append(
                {
                    "latitude": report.latitude,
                    "longitude": report.longitude,
                    "label": report.description[:48],
                }
            )

        if not timeline:
            return ReconstructResponse(
                event_id=event_id,
                status=AgentStatus.COMPLETED,
                timeline=[],
                affected_locations=[],
                severity=None,
                evidence=[],
                confidence=0.0,
            )

        severity = event.severity
        confidence = min(0.95, 0.5 + 0.05 * len(timeline))
        confidence = round(confidence, 2)

        return ReconstructResponse(
            event_id=event_id,
            status=AgentStatus.COMPLETED,
            timeline=timeline,
            affected_locations=affected_locations,
            severity=severity,
            evidence=evidence,
            confidence=confidence,
        )