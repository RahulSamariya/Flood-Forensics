"use client";

import { useMemo, useState } from "react";
import { Layers, Loader2, MapPin } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import type {
  CitizenReport,
  DrainNode,
  FloodEventSummary,
  RoadSegment,
  WaterLevelReading,
} from "@/types";
import { cn } from "@/lib/utils";
import { MapFallback } from "./map-fallback";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export type MapLayerKey =
  | "events"
  | "drains"
  | "roads"
  | "water_levels"
  | "reports";

const LAYERS: { key: MapLayerKey; label: string; default: boolean }[] = [
  { key: "events", label: "Flood events", default: true },
  { key: "drains", label: "Drainage", default: true },
  { key: "roads", label: "Roads", default: true },
  { key: "water_levels", label: "Water levels", default: true },
  { key: "reports", label: "Citizen reports", default: true },
];

export function OperationalMap({ height = "h-full" }: { height?: string }) {
  const events = useApi(() => api.events.list());
  const drains = useApi(() => api.drains.list());
  const roads = useApi(() => api.roads.list());
  const water = useApi(() => api.events.waterLevels("F2026-001"));
  const reports = useApi(() => api.events.reports("F2026-001"));

  const [activeLayers, setActiveLayers] = useState<MapLayerKey[]>(
    LAYERS.filter((l) => l.default).map((l) => l.key),
  );

  const loading = events.loading || drains.loading || roads.loading;

  const toggleLayer = (key: MapLayerKey) => {
    setActiveLayers((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const mapData = useMemo(
    () => ({
      events: events.data ?? [],
      drains: drains.data ?? [],
      roads: roads.data ?? [],
      water: water.data ?? [],
      reports: reports.data ?? [],
    }),
    [events.data, drains.data, roads.data, water.data, reports.data],
  );

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold">Operational Map</h2>
            <p className="text-xs text-muted-foreground">
              {MAPBOX_TOKEN
                ? "Mapbox GL"
                : "SVG projection (add NEXT_PUBLIC_MAPBOX_TOKEN for Mapbox)"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {LAYERS.map((layer) => (
              <button
                key={layer.key}
                onClick={() => toggleLayer(layer.key)}
                className={cn(
                  "rounded border px-2 py-0.5 text-xs transition-colors",
                  activeLayers.includes(layer.key)
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading map data…
          </div>
        ) : (
          <MapFallback
            events={mapData.events}
            drains={mapData.drains}
            roads={mapData.roads}
            water={mapData.water}
            reports={mapData.reports}
            activeLayers={activeLayers}
          />
        )}
      </div>
    </div>
  );
}