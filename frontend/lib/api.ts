const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(body || response.statusText, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () =>
    request<{ status: string; version: string; ai_provider: string }>("/health"),

  events: {
    list: () => request<FloodEventSummary[]>("/api/events"),
    get: (id: string) => request<FloodEventDetail>(`/api/events/${id}`),
    rainfall: (id: string) =>
      request<RainfallReading[]>(`/api/events/${id}/rainfall`),
    waterLevels: (id: string) =>
      request<WaterLevelReading[]>(`/api/events/${id}/water-levels`),
    reports: (id: string) =>
      request<CitizenReport[]>(`/api/events/${id}/reports`),
    responseActions: (id: string) =>
      request<ResponseAction[]>(`/api/events/${id}/response-actions`),
    reconstruct: (id: string) =>
      request<ReconstructResponse>(`/api/events/${id}/reconstruct`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
  },

  commander: {
    analyze: (payload: { event_id?: string; query?: string }) =>
      request<CommanderResponse>("/api/commander/analyze", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  agents: {
    rootCause: (eventId: string) =>
      request<RootCauseResponse>("/api/agents/root-cause", {
        method: "POST",
        body: JSON.stringify({ event_id: eventId }),
      }),
    recurrence: (eventId: string) =>
      request<RecurrenceResponse>("/api/agents/recurrence", {
        method: "POST",
        body: JSON.stringify({ event_id: eventId }),
      }),
    permanentFix: (eventId: string) =>
      request<PermanentFixResponse>("/api/agents/permanent-fix", {
        method: "POST",
        body: JSON.stringify({ event_id: eventId }),
      }),
    fieldVerification: (inspectionId: string) =>
      request<FieldVerificationResponse>("/api/agents/field-verification", {
        method: "POST",
        body: JSON.stringify({ inspection_id: inspectionId }),
      }),
  },

  drains: {
    list: () => request<DrainNode[]>("/api/drains"),
  },

  roads: {
    list: () => request<RoadSegment[]>("/api/roads"),
  },

  recommendations: {
    list: (eventId?: string) => {
      const qs = eventId ? `?event_id=${eventId}` : "";
      return request<Recommendation[]>(`/api/recommendations${qs}`);
    },
  },

  fieldInspections: {
    list: () => request<FieldInspection[]>("/api/field-inspections"),
    create: (payload: FieldInspectionCreatePayload) =>
      request<FieldInspection>("/api/field-inspections", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
};

// Re-export types used by API client
import type {
  CitizenReport,
  CommanderResponse,
  DrainNode,
  FieldInspection,
  FieldInspectionCreatePayload,
  FieldVerificationResponse,
  FloodEventDetail,
  FloodEventSummary,
  PermanentFixResponse,
  RainfallReading,
  Recommendation,
  ReconstructResponse,
  RecurrenceResponse,
  ResponseAction,
  RoadSegment,
  RootCauseResponse,
  WaterLevelReading,
} from "@/types";
