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
  severity?: string;
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

export interface RootCauseResponse {
  event_id: string;
  status: AgentStatus;
  ranked_causes: RankedCause[];
  confidence: number;
}

export interface RecurrenceResponse {
  event_id: string;
  status: AgentStatus;
  flood_dna?: FloodDNA | null;
  similar_events: SimilarEvent[];
  confidence: number;
}

export interface SimilarEvent {
  event_id: string;
  event_date: string;
  severity: string;
  water_depth_cm?: number | null;
  similarity_score: number;
  shared_factors: string[];
}

export interface PermanentFixResponse {
  event_id: string;
  status: AgentStatus;
  immediate_response: Intervention[];
  permanent_interventions: Intervention[];
  confidence: number;
}

export interface FieldVerificationResponse {
  inspection_id: string;
  status: AgentStatus;
  verification_status: string;
  blockage_before?: number | null;
  blockage_after?: number | null;
  findings: string[];
  confidence: number;
  allow_human_override: boolean;
}

export interface FieldInspectionCreatePayload {
  work_id?: string | null;
  drain_id: string;
  inspector_id: string;
  latitude: number;
  longitude: number;
  image_before?: string | null;
  image_after?: string | null;
  blockage_before?: number | null;
  blockage_after?: number | null;
  notes?: string | null;
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
  length_m?: number;
  elevation?: number;
  flood_threshold_cm?: number;
  traffic_level?: string;
  criticality?: string;
}

export interface RainfallReading {
  id: number;
  timestamp: string;
  station_id: string;
  rainfall_mm: number;
  duration_minutes: number;
  rainfall_intensity_mm_hr: number;
  source: string;
}

export interface WaterLevelReading {
  id: number;
  timestamp: string;
  station_id: string;
  water_level_m: number;
  danger_level_m: number;
  status: string;
  latitude?: number;
  longitude?: number;
}

export interface CitizenReport {
  report_id: string;
  event_id?: string | null;
  timestamp: string;
  latitude: number;
  longitude: number;
  description: string;
  water_depth_cm?: number | null;
  severity: string;
  verification_status: string;
  confidence: number;
}

export interface ResponseAction {
  action_id: string;
  event_id?: string | null;
  action_type: string;
  timestamp?: string | null;
  location?: string | null;
  team_id?: string | null;
  status: string;
  effectiveness?: string | null;
}

export interface FieldInspection {
  inspection_id: string;
  work_id?: string | null;
  drain_id: string;
  inspector_id: string;
  timestamp?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  image_before?: string | null;
  image_after?: string | null;
  blockage_before?: number | null;
  blockage_after?: number | null;
  condition_before?: number | null;
  condition_after?: number | null;
  ai_verification_score?: number | null;
  verification_status: string;
  notes: string;
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
