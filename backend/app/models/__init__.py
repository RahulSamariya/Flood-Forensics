"""SQLAlchemy ORM models for all 14 Flood Forensics tables (Phase 3).

Works on local SQLite for development and PostgreSQL/PostGIS in production
by overriding DATABASE_URL. Geometry is stored as plain lat/lon columns so
the same models run against both engines; the Supabase migration
(`supabase/migrations/00001_schema.sql`) uses PostGIS types for production.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FloodEvent(Base, TimestampMixin):
    __tablename__ = "flood_events"

    event_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    event_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    city: Mapped[str] = mapped_column(String(64))
    zone_id: Mapped[str | None] = mapped_column(String(16), nullable=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    severity: Mapped[str] = mapped_column(String(16))
    water_depth_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    affected_area_km2: Mapped[float | None] = mapped_column(Float, nullable=True)
    affected_population: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source: Mapped[str] = mapped_column(String(16), default="DEMO")
    confidence: Mapped[float] = mapped_column(Float, default=0.0)


class Rainfall(Base):
    __tablename__ = "rainfall"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    station_id: Mapped[str] = mapped_column(String(32))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    rainfall_mm: Mapped[float] = mapped_column(Float)
    duration_minutes: Mapped[int] = mapped_column(Integer)
    rainfall_intensity_mm_hr: Mapped[float] = mapped_column(Float)
    source: Mapped[str] = mapped_column(String(16), default="DEMO")


class WaterLevel(Base):
    __tablename__ = "water_levels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    station_id: Mapped[str] = mapped_column(String(32))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    water_level_m: Mapped[float] = mapped_column(Float)
    danger_level_m: Mapped[float] = mapped_column(Float)
    flow_rate_m3_s: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="normal")


class Drain(Base):
    __tablename__ = "drains"

    drain_id: Mapped[str] = mapped_column(String(16), primary_key=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    drain_type: Mapped[str] = mapped_column(String(16))
    capacity_m3_s: Mapped[float] = mapped_column(Float)
    diameter_mm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    depth_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    length_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    condition_score: Mapped[int] = mapped_column(Integer, default=5)
    blockage_percent: Mapped[float] = mapped_column(Float, default=0.0)
    last_cleaned: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    installation_year: Mapped[int | None] = mapped_column(Integer, nullable=True)


class DrainConnection(Base):
    __tablename__ = "drain_connections"

    connection_id: Mapped[str] = mapped_column(String(16), primary_key=True)
    from_drain_id: Mapped[str] = mapped_column(ForeignKey("drains.drain_id"))
    to_drain_id: Mapped[str] = mapped_column(ForeignKey("drains.drain_id"))
    flow_direction: Mapped[str] = mapped_column(String(16), default="downstream")
    distance_m: Mapped[float] = mapped_column(Float)
    capacity_m3_s: Mapped[float] = mapped_column(Float)

    from_drain: Mapped[Drain] = relationship(foreign_keys=[from_drain_id])
    to_drain: Mapped[Drain] = relationship(foreign_keys=[to_drain_id])


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    work_id: Mapped[str] = mapped_column(String(16), primary_key=True)
    drain_id: Mapped[str] = mapped_column(ForeignKey("drains.drain_id"))
    reported_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    scheduled_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    issue_type: Mapped[str] = mapped_column(String(32))
    issue_description: Mapped[str] = mapped_column(Text, default="")
    action_taken: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(16), default="pending")
    reported_blockage_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    completion_blockage_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    verification_status: Mapped[str] = mapped_column(String(16), default="pending")

    drain: Mapped[Drain] = relationship()


class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    report_id: Mapped[str] = mapped_column(String(16), primary_key=True)
    event_id: Mapped[str | None] = mapped_column(ForeignKey("flood_events.event_id"), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    description: Mapped[str] = mapped_column(Text, default="")
    water_depth_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    severity: Mapped[str] = mapped_column(String(16), default="medium")
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    verification_status: Mapped[str] = mapped_column(String(16), default="unverified")
    confidence: Mapped[float] = mapped_column(Float, default=0.5)


class FieldInspection(Base):
    __tablename__ = "field_inspections"

    inspection_id: Mapped[str] = mapped_column(String(16), primary_key=True)
    work_id: Mapped[str | None] = mapped_column(ForeignKey("maintenance_records.work_id"), nullable=True)
    drain_id: Mapped[str] = mapped_column(ForeignKey("drains.drain_id"))
    inspector_id: Mapped[str] = mapped_column(String(32))
    timestamp: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    image_before: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_after: Mapped[str | None] = mapped_column(Text, nullable=True)
    blockage_before: Mapped[float | None] = mapped_column(Float, nullable=True)
    blockage_after: Mapped[float | None] = mapped_column(Float, nullable=True)
    condition_before: Mapped[int | None] = mapped_column(Integer, nullable=True)
    condition_after: Mapped[int | None] = mapped_column(Integer, nullable=True)
    ai_verification_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    verification_status: Mapped[str] = mapped_column(String(16), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")


class Road(Base):
    __tablename__ = "roads"

    road_id: Mapped[str] = mapped_column(String(16), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    road_type: Mapped[str] = mapped_column(String(32))
    importance: Mapped[str] = mapped_column(String(16), default="standard")
    length_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    elevation: Mapped[float | None] = mapped_column(Float, nullable=True)
    flood_threshold_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    traffic_level: Mapped[str] = mapped_column(String(16), default="medium")
    criticality: Mapped[str] = mapped_column(String(16), default="standard")


class ResponseAction(Base):
    __tablename__ = "response_actions"

    action_id: Mapped[str] = mapped_column(String(16), primary_key=True)
    event_id: Mapped[str | None] = mapped_column(ForeignKey("flood_events.event_id"), nullable=True)
    action_type: Mapped[str] = mapped_column(String(32))
    timestamp: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    location: Mapped[str | None] = mapped_column(String(128), nullable=True)
    team_id: Mapped[str | None] = mapped_column(String(16), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="scheduled")
    completion_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    effectiveness: Mapped[str | None] = mapped_column(String(16), nullable=True)


class DamageReport(Base):
    __tablename__ = "damage_reports"

    damage_id: Mapped[str] = mapped_column(String(16), primary_key=True)
    event_id: Mapped[str | None] = mapped_column(ForeignKey("flood_events.event_id"), nullable=True)
    location: Mapped[str] = mapped_column(String(128))
    damage_type: Mapped[str] = mapped_column(String(32))
    severity: Mapped[str] = mapped_column(String(16), default="medium")
    estimated_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str | None] = mapped_column(ForeignKey("flood_events.event_id"), nullable=True)
    agent_name: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(16), default="pending")
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    output: Mapped[str] = mapped_column(Text, default="")


class AgentFinding(Base):
    __tablename__ = "agent_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str | None] = mapped_column(ForeignKey("flood_events.event_id"), nullable=True)
    agent_name: Mapped[str] = mapped_column(String(32))
    finding_type: Mapped[str] = mapped_column(String(32))
    finding: Mapped[str] = mapped_column(Text)
    evidence: Mapped[str] = mapped_column(Text, default="[]")
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[str | None] = mapped_column(ForeignKey("flood_events.event_id"), nullable=True)
    recommendation_type: Mapped[str] = mapped_column(String(32))
    title: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(Text, default="")
    estimated_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    expected_risk_reduction: Mapped[float | None] = mapped_column(Float, nullable=True)
    priority: Mapped[str] = mapped_column(String(16), default="medium")
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    status: Mapped[str] = mapped_column(String(16), default="recommended")