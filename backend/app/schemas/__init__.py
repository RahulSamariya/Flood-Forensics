"""Pydantic request/response schemas."""

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "0.1.0"
    ai_provider: str


class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class EvidenceSchema(BaseModel):
    source: str
    reference: str
    description: str
    value: str | float | int | None = None


class AgentFindingSchema(BaseModel):
    agent_name: str
    finding_type: str
    finding: str
    evidence: list[EvidenceSchema] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)


# ---------------------------------------------------------------------------
# Flood Events
# ---------------------------------------------------------------------------

class FloodEventSummary(BaseModel):
    event_id: str
    event_date: datetime
    city: str
    zone_id: str | None = None
    latitude: float
    longitude: float
    severity: str
    water_depth_cm: float | None = None
    source: str = "DEMO"


class FloodEventDetail(FloodEventSummary):
    end_date: datetime | None = None
    duration_minutes: int | None = None
    affected_area_km2: float | None = None
    affected_population: int | None = None
    confidence: float | None = None


# ---------------------------------------------------------------------------
# Agent Requests / Responses (stubs for Phase 5+)
# ---------------------------------------------------------------------------

class ReconstructRequest(BaseModel):
    include_citizen_reports: bool = True
    include_response_actions: bool = True


class ReconstructResponse(BaseModel):
    event_id: str
    status: AgentStatus
    timeline: list[dict[str, Any]] = Field(default_factory=list)
    affected_locations: list[dict[str, Any]] = Field(default_factory=list)
    severity: str | None = None
    evidence: list[EvidenceSchema] = Field(default_factory=list)
    confidence: float = 0.0


class RootCauseRequest(BaseModel):
    event_id: str


class RankedCause(BaseModel):
    cause: str
    probability: float = Field(ge=0.0, le=1.0)
    supporting_evidence: list[EvidenceSchema] = Field(default_factory=list)
    contradicting_evidence: list[EvidenceSchema] = Field(default_factory=list)
    explanation: str


class RootCauseResponse(BaseModel):
    event_id: str
    status: AgentStatus
    ranked_causes: list[RankedCause] = Field(default_factory=list)
    confidence: float = 0.0


class RecurrenceRequest(BaseModel):
    event_id: str


class FloodDNA(BaseModel):
    rainfall_threshold_mm: float | None = None
    critical_duration_minutes: int | None = None
    common_causes: list[str] = Field(default_factory=list)
    recurrence_count: int = 0
    average_recovery_minutes: int | None = None
    vulnerable_infrastructure: list[str] = Field(default_factory=list)


class RecurrenceResponse(BaseModel):
    event_id: str
    status: AgentStatus
    flood_dna: FloodDNA | None = None
    similar_events: list[dict[str, Any]] = Field(default_factory=list)
    confidence: float = 0.0


class PermanentFixRequest(BaseModel):
    event_id: str


class Intervention(BaseModel):
    intervention: str
    intervention_type: str  # immediate | permanent
    estimated_cost: float | None = None
    expected_risk_reduction: float | None = None
    implementation_time_days: int | None = None
    priority: str = "medium"
    confidence: float = 0.0


class PermanentFixResponse(BaseModel):
    event_id: str
    status: AgentStatus
    immediate_response: list[Intervention] = Field(default_factory=list)
    permanent_interventions: list[Intervention] = Field(default_factory=list)
    confidence: float = 0.0


class FieldVerificationRequest(BaseModel):
    inspection_id: str


class FieldVerificationResponse(BaseModel):
    inspection_id: str
    status: AgentStatus
    verification_status: str = "PENDING"
    blockage_before: float | None = None
    blockage_after: float | None = None
    findings: list[str] = Field(default_factory=list)
    confidence: float = 0.0
    allow_human_override: bool = True


class CommanderAnalyzeRequest(BaseModel):
    event_id: str | None = None
    query: str | None = None


class CommanderAnalyzeResponse(BaseModel):
    status: AgentStatus
    incident_brief: str = ""
    primary_cause: str | None = None
    supporting_evidence: list[EvidenceSchema] = Field(default_factory=list)
    recurrence_summary: str | None = None
    recommended_intervention: str | None = None
    verification_status: str | None = None
    resilience_score: float | None = None
    confidence: float = 0.0
    agent_findings: list[AgentFindingSchema] = Field(default_factory=list)


class FieldInspectionCreate(BaseModel):
    work_id: str | None = None
    drain_id: str
    inspector_id: str
    latitude: float
    longitude: float
    image_before: str | None = None
    image_after: str | None = None
    blockage_before: float | None = None
    blockage_after: float | None = None
    notes: str | None = None
