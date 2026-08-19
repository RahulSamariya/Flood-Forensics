export type AgentStatus = "pending" | "running" | "completed" | "failed";

export interface Evidence {
  source: string;
  reference: string;
  description: string;
  value?: string | number | null;
}

export interface FloodEventSummary {
  event_id: string;
  event_date: string;
  city: string;
  zone_id?: string | null;
  latitude: number;
  longitude: number;
  severity: string;
  water_depth_cm?: number | null;
  source: string;
}

export interface FloodEventDetail extends FloodEventSummary {
  end_date?: string | null;
  duration_minutes?: number | null;
  affected_area_km2?: number | null;
  affected_population?: number | null;
  confidence?: number | null;
}

export interface ReconstructResponse {
  event_id: string;
  status: AgentStatus;
  timeline: TimelineEntry[];
  affected_locations: AffectedLocation[];
  severity?: string | null;
  evidence: Evidence[];
  confidence: number;
}

export interface TimelineEntry {
  timestamp: string;
  event: string;
  source?: string;
}

export interface AffectedLocation {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface RankedCause {
  cause: string;
  probability: number;
  supporting_evidence: Evidence[];
  contradicting_evidence: Evidence[];
  explanation: string;
}

export interface FloodDNA {
  rainfall_threshold_mm?: number | null;
  critical_duration_minutes?: number | null;
  common_causes: string[];
  recurrence_count: number;
  average_recovery_minutes?: number | null;
  vulnerable_infrastructure: string[];
}

export interface Intervention {
  intervention: string;
  intervention_type: "immediate" | "permanent";
  estimated_cost?: number | null;
  expected_risk_reduction?: number | null;
  implementation_time_days?: number | null;
  priority: string;
  confidence: number;
}

export interface CommanderResponse {
  status: AgentStatus;
  incident_brief: string;
  primary_cause?: string | null;
  supporting_evidence: Evidence[];
  recurrence_summary?: string | null;
  recommended_intervention?: string | null;
  verification_status?: string | null;
  resilience_score?: number | null;
  confidence: number;
  agent_findings: AgentFinding[];
}

export interface AgentFinding {
  agent_name: string;
  finding_type: string;
  finding: string;
  evidence: Evidence[];
  confidence: number;
}

export interface DrainNode {
  drain_id: string;
  latitude: number;
  longitude: number;
  drain_type: string;
  condition_score?: number;
  blockage_percent?: number;
}

export interface RoadSegment {
  road_id: string;
  name: string;
  road_type: string;
  importance: string;
  flood_threshold_cm?: number;
}

export interface Recommendation {
  id: string;
  event_id: string;
  recommendation_type: string;
  title: string;
  description: string;
  estimated_cost?: number | null;
  expected_risk_reduction?: number | null;
  priority: string;
  confidence: number;
  status: string;
}

export interface AgentDefinition {
  name: string;
  label: string;
  description: string;
  phase: number;
}

export const AGENT_PIPELINE: AgentDefinition[] = [
  {
    name: "event_reconstructor",
    label: "Event Reconstructor",
    description: "Rebuilds timeline from rainfall, water levels, and reports",
    phase: 5,
  },
  {
    name: "root_cause",
    label: "Root Cause",
    description: "Ranked causal analysis with evidence",
    phase: 6,
  },
  {
    name: "recurrence",
    label: "Recurrence",
    description: "Flood DNA and similar event search",
    phase: 7,
  },
  {
    name: "permanent_fix",
    label: "Permanent Fix",
    description: "Intervention recommendations",
    phase: 8,
  },
  {
    name: "field_verification",
    label: "Field Verification",
    description: "Before/after inspection analysis",
    phase: 9,
  },
  {
    name: "commander",
    label: "Urban Resilience Commander",
    description: "Orchestrates agents and NL queries",
    phase: 10,
  },
];
