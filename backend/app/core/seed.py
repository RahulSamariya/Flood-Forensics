"""F2026-001 demo seed data (Phase 2).

All records are clearly labeled DEMO/SIMULATED and are internally consistent
so agents can reason over them. Seeded idempotently on application startup.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    CitizenReport,
    DamageReport,
    Drain,
    DrainConnection,
    FieldInspection,
    FloodEvent,
    MaintenanceRecord,
    Rainfall,
    Recommendation,
    ResponseAction,
    Road,
    WaterLevel,
)

UTC = timezone.utc


def _dt(day: int, hour: int, minute: int = 0) -> datetime:
    return datetime(2026, 6, day, hour, minute, tzinfo=UTC)


def build_seed() -> dict[str, list]:
    """Return F2026-001 demo records grouped by table."""
    event_date = _dt(15, 13, 30)
    end_date = _dt(15, 17, 30)

    # ------------------------------------------------------------------
    # Flood event + historical events (recurrence compares against these)
    # ------------------------------------------------------------------
    flood_events = [
        FloodEvent(
            event_id="F2026-001",
            event_date=event_date,
            end_date=end_date,
            city="Chennai",
            zone_id="J18",
            latitude=13.0827,
            longitude=80.2707,
            severity="critical",
            water_depth_cm=65.0,
            duration_minutes=240,
            affected_area_km2=2.4,
            affected_population=18000,
            source="DEMO",
            confidence=0.9,
        ),
        FloodEvent(
            event_id="F2025-003",
            event_date=datetime(2025, 7, 22, 13, 45, tzinfo=UTC),
            end_date=datetime(2025, 7, 22, 17, 15, tzinfo=UTC),
            city="Chennai",
            zone_id="J18",
            latitude=13.0824,
            longitude=80.2710,
            severity="high",
            water_depth_cm=58.0,
            duration_minutes=210,
            affected_area_km2=1.9,
            affected_population=12000,
            source="DEMO",
            confidence=0.85,
        ),
        FloodEvent(
            event_id="F2024-011",
            event_date=datetime(2024, 8, 10, 14, 10, tzinfo=UTC),
            end_date=datetime(2024, 8, 10, 17, 10, tzinfo=UTC),
            city="Chennai",
            zone_id="J18",
            latitude=13.0830,
            longitude=80.2702,
            severity="medium",
            water_depth_cm=45.0,
            duration_minutes=180,
            affected_area_km2=1.2,
            affected_population=8000,
            source="DEMO",
            confidence=0.8,
        ),
    ]

    # ------------------------------------------------------------------
    # Rainfall — rain begins 13:00, peak intensity 68mm/hr at 15:00
    # ------------------------------------------------------------------
    rainfall_rows = [
        (12, 0, 2.0, 60, 2.0),
        (12, 30, 3.0, 30, 6.0),
        (13, 0, 8.0, 60, 8.0),
        (13, 30, 14.0, 30, 28.0),
        (14, 0, 12.0, 30, 24.0),
        (14, 30, 18.0, 30, 36.0),
        (15, 0, 34.0, 30, 68.0),
        (15, 30, 22.0, 30, 44.0),
        (16, 0, 12.0, 60, 12.0),
        (16, 30, 6.0, 60, 6.0),
        (17, 0, 3.0, 60, 3.0),
        (18, 0, 1.0, 60, 1.0),
    ]
    rainfall = [
        Rainfall(
            timestamp=_dt(15, hour, minute),
            station_id="S-RAIN-07",
            latitude=13.0827,
            longitude=80.2707,
            rainfall_mm=mm,
            duration_minutes=dur,
            rainfall_intensity_mm_hr=intensity,
            source="DEMO",
        )
        for hour, minute, mm, dur, intensity in rainfall_rows
    ]

    # ------------------------------------------------------------------
    # Water levels — danger level 1.5m, exceeded 14:30, peaks 15:00
    # ------------------------------------------------------------------
    water_level_rows = [
        (13, 0, 0.60, "normal"),
        (13, 30, 0.72, "normal"),
        (14, 0, 0.95, "watch"),
        (14, 30, 1.28, "warning"),
        (15, 0, 1.86, "critical"),
        (15, 30, 1.72, "critical"),
        (16, 0, 1.48, "warning"),
        (16, 30, 1.30, "warning"),
        (17, 0, 1.05, "normal"),
        (17, 30, 0.82, "normal"),
    ]
    water_levels = [
        WaterLevel(
            timestamp=_dt(15, hour, minute),
            station_id="W-RIVER-07",
            latitude=13.0827,
            longitude=80.2707,
            water_level_m=level,
            danger_level_m=1.5,
            flow_rate_m3_s=round(2.0 + level, 2),
            status=status,
        )
        for hour, minute, level, status in water_level_rows
    ]

    # ------------------------------------------------------------------
    # Drains — D142 is the blocked culprit (71% blockage)
    # ------------------------------------------------------------------
    drains = [
        Drain(
            drain_id="D141",
            latitude=13.0820,
            longitude=80.2695,
            drain_type="main",
            capacity_m3_s=2.0,
            diameter_mm=900,
            depth_m=2.5,
            length_m=320.0,
            condition_score=8,
            blockage_percent=5.0,
            last_cleaned=_dt(1, 9, 0),
            installation_year=2010,
        ),
        Drain(
            drain_id="D142",
            latitude=13.0827,
            longitude=80.2707,
            drain_type="branch",
            capacity_m3_s=1.2,
            diameter_mm=600,
            depth_m=1.8,
            length_m=410.0,
            condition_score=3,
            blockage_percent=71.0,
            last_cleaned=_dt(10, 9, 0) - timedelta(days=278),
            installation_year=2008,
        ),
        Drain(
            drain_id="D143",
            latitude=13.0835,
            longitude=80.2720,
            drain_type="main",
            capacity_m3_s=1.8,
            diameter_mm=750,
            depth_m=2.1,
            length_m=260.0,
            condition_score=6,
            blockage_percent=22.0,
            last_cleaned=_dt(14, 2, 0),
            installation_year=2008,
        ),
        Drain(
            drain_id="D301",
            latitude=13.0900,
            longitude=80.2600,
            drain_type="branch",
            capacity_m3_s=1.5,
            diameter_mm=700,
            depth_m=2.0,
            length_m=380.0,
            condition_score=9,
            blockage_percent=4.0,
            last_cleaned=_dt(5, 5, 0),
            installation_year=2015,
        ),
    ]

    # ------------------------------------------------------------------
    # Drain connections
    # ------------------------------------------------------------------
    drain_connections = [
        DrainConnection(
            connection_id="C-1",
            from_drain_id="D141",
            to_drain_id="D142",
            flow_direction="downstream",
            distance_m=85.0,
            capacity_m3_s=1.2,
        ),
        DrainConnection(
            connection_id="C-2",
            from_drain_id="D142",
            to_drain_id="D143",
            flow_direction="downstream",
            distance_m=120.0,
            capacity_m3_s=1.2,
        ),
    ]

    # ------------------------------------------------------------------
    # Maintenance records
    # ------------------------------------------------------------------
    maintenance_records = [
        MaintenanceRecord(
            work_id="W-88",
            drain_id="D142",
            reported_date=_dt(16, 9, 0),
            scheduled_date=_dt(22, 9, 0),
            completed_date=_dt(24, 9, 0),
            issue_type="blockage",
            issue_description="71% blockage from silt and debris in J18 branch drain.",
            action_taken="High-pressure jetting and desilting of D142.",
            status="completed",
            reported_blockage_percent=71.0,
            completion_blockage_percent=8.0,
            verification_status="pending",
        ),
        MaintenanceRecord(
            work_id="W-77",
            drain_id="D143",
            reported_date=datetime(2026, 3, 2, 10, 0, tzinfo=UTC),
            scheduled_date=datetime(2026, 3, 10, 10, 0, tzinfo=UTC),
            completed_date=datetime(2026, 3, 10, 14, 0, tzinfo=UTC),
            issue_type="routine",
            issue_description="Routine inspection of D143.",
            action_taken="Inspection only; no action required.",
            status="completed",
            reported_blockage_percent=18.0,
            completion_blockage_percent=15.0,
            verification_status="verified",
        ),
    ]

    # ------------------------------------------------------------------
    # Citizen reports
    # ------------------------------------------------------------------
    citizen_reports = [
        CitizenReport(
            report_id="C-101",
            event_id="F2026-001",
            timestamp=_dt(15, 14, 37),
            latitude=13.0826,
            longitude=80.2709,
            description="Waterlogged road in front of J18 market, two-wheelers unable to pass.",
            water_depth_cm=25.0,
            severity="medium",
            verification_status="confirmed",
            confidence=0.8,
        ),
        CitizenReport(
            report_id="C-102",
            event_id="F2026-001",
            timestamp=_dt(15, 15, 10),
            latitude=13.0830,
            longitude=80.2712,
            description="Knee-deep water entering shop entrances at J18.",
            water_depth_cm=40.0,
            severity="high",
            verification_status="confirmed",
            confidence=0.85,
        ),
    ]

    # ------------------------------------------------------------------
    # Roads
    # ------------------------------------------------------------------
    roads = [
        Road(
            road_id="R-512",
            name="J18 Market Road",
            road_type="arterial",
            importance="high",
            length_m=1200.0,
            elevation=3.2,
            flood_threshold_cm=15.0,
            traffic_level="high",
            criticality="critical",
        ),
        Road(
            road_id="R-114",
            name="Old Toll Gate Road",
            road_type="collector",
            importance="medium",
            length_m=2400.0,
            elevation=8.5,
            flood_threshold_cm=25.0,
            traffic_level="medium",
            criticality="standard",
        ),
    ]

    # ------------------------------------------------------------------
    # Response actions
    # ------------------------------------------------------------------
    response_actions = [
        ResponseAction(
            action_id="A-7",
            event_id="F2026-001",
            action_type="pump_deployment",
            timestamp=_dt(15, 15, 5),
            location="J18 Market Road",
            team_id="T-09",
            status="completed",
            completion_time=_dt(15, 15, 45),
            effectiveness="medium",
        ),
        ResponseAction(
            action_id="A-8",
            event_id="F2026-001",
            action_type="traffic_closure",
            timestamp=_dt(15, 15, 12),
            location="J18 Market Road",
            team_id="T-02",
            status="completed",
            completion_time=_dt(15, 15, 15),
            effectiveness="high",
        ),
    ]

    # ------------------------------------------------------------------
    # Field inspections (Phase 9 verification reads these)
    # ------------------------------------------------------------------
    field_inspections = [
        FieldInspection(
            inspection_id="I-3001",
            work_id="W-88",
            drain_id="D142",
            inspector_id="INSP-01",
            timestamp=_dt(25, 11, 0),
            latitude=13.0827,
            longitude=80.2707,
            image_before="demo://drain/D142/before.jpg",
            image_after="demo://drain/D142/after.jpg",
            blockage_before=71.0,
            blockage_after=8.0,
            condition_before=3,
            condition_after=8,
            ai_verification_score=None,
            verification_status="pending",
            notes="Desilting complete; flow restored.",
        ),
    ]

    # ------------------------------------------------------------------
    # Damage reports
    # ------------------------------------------------------------------
    damage_reports = [
        DamageReport(
            damage_id="D-90",
            event_id="F2026-001",
            location="J18 Market Road",
            damage_type="road_flooding",
            severity="medium",
            estimated_cost=150000.0,
            verified=False,
        ),
    ]

    # ------------------------------------------------------------------
    # Seed recommendations (Permanent Fix agent adds more in Phase 8)
    # ------------------------------------------------------------------
    recommendations = [
        Recommendation(
            event_id="F2026-001",
            recommendation_type="maintenance",
            title="Desilt and rehabilitate drain D142",
            description="Jetting, desilting, and condition repair of the 71%-blocked J18 branch drain.",
            estimated_cost=85000.0,
            expected_risk_reduction=0.6,
            priority="high",
            confidence=0.8,
            status="recommended",
        ),
        Recommendation(
            event_id="F2026-001",
            recommendation_type="infrastructure",
            title="Upsize D142 branch drain to 900mm",
            description="Replace 600mm branch drain with 900mm to raise capacity above observed inflow.",
            estimated_cost=420000.0,
            expected_risk_reduction=0.35,
            priority="medium",
            confidence=0.6,
            status="proposed",
        ),
    ]

    return {
        "flood_events": flood_events,
        "rainfall": rainfall,
        "water_levels": water_levels,
        "drains": drains,
        "drain_connections": drain_connections,
        "maintenance_records": maintenance_records,
        "citizen_reports": citizen_reports,
        "roads": roads,
        "response_actions": response_actions,
        "field_inspections": field_inspections,
        "damage_reports": damage_reports,
        "recommendations": recommendations,
    }


async def seed_database(session: AsyncSession) -> None:
    """Insert demo records if the events table is empty (idempotent)."""
    existing = (await session.execute(select(FloodEvent.event_id))).scalars().first()
    if existing:
        return

    data = build_seed()
    for rows in data.values():
        session.add_all(rows)
    await session.commit()