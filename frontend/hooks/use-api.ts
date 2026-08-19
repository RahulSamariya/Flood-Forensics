"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(fetcher: () => Promise<T>): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `API error (${err.status}): ${err.message}`
          : err instanceof Error
            ? err.message
            : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useHealth() {
  return useApi(() => api.health());
}

export function useDashboardStats() {
  return useApi(useCallback(() => api.dashboard.stats(), []));
}

export function useEvents() {
  return useApi(useCallback(() => api.events.list(), []));
}

export function useEvent(id: string) {
  return useApi(useCallback(() => api.events.get(id), [id]));
}

export function useRainfall() {
  return useApi(useCallback(() => api.rainfall.list(), []));
}

export function useWaterLevels() {
  return useApi(useCallback(() => api.waterLevels.list(), []));
}

export function useCitizenReports(eventId?: string) {
  return useApi(useCallback(() => api.citizenReports.list(eventId), [eventId]));
}

export function useDrains() {
  return useApi(useCallback(() => api.drains.list(), []));
}

export function useRoads() {
  return useApi(useCallback(() => api.roads.list(), []));
}

export function useRecommendations(eventId?: string) {
  return useApi(useCallback(() => api.recommendations.list(eventId), [eventId]));
}
