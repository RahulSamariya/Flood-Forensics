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

  dashboard: {
    stats: () => request<DashboardStats>("/api/dashboard/stats"),
  },

  events: {
    list: () => request<FloodEventSummary[]>("/api/events"),
    get: (id: string) => request<FloodEventDetail>(`/api/events/${id}`),
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

  rainfall: {
    list: (stationId?: string) => {
      const qs = stationId ? `?station_id=${stationId}` : "";
      return request<RainfallReading[]>(`/api/rainfall${qs}`);
    },
  },

  waterLevels: {
    list: (stationId?: string) => {
      const qs = stationId ? `?station_id=${stationId}` : "";
      return request<WaterLevelReading[]>(`/api/water-levels${qs}`);
    },
  },

  citizenReports: {
    list: (eventId?: string) => {
      const qs = eventId ? `?event_id=${eventId}` : "";
      return request<CitizenReport[]>(`/api/citizen-reports${qs}`);
    },
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
};

// Re-export types used by API client
import type {
  CitizenReport,
  CommanderResponse,
  DashboardStats,
  DrainNode,
  FloodEventDetail,
  FloodEventSummary,
  RainfallReading,
  Recommendation,
  ReconstructResponse,
  RoadSegment,
  WaterLevelReading,
} from "@/types";
