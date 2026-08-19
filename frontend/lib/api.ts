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
  CommanderResponse,
  DrainNode,
  FloodEventDetail,
  FloodEventSummary,
  Recommendation,
  ReconstructResponse,
  RoadSegment,
} from "@/types";
