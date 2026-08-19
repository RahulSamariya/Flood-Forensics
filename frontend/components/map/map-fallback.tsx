"use client";

import { useMemo, useState } from "react";
import type {
  CitizenReport,
  DrainNode,
  FloodEventSummary,
  RoadSegment,
  WaterLevelReading,
} from "@/types";
import type { MapLayerKey } from "./operational-map";

interface MapFallbackProps {
  events: FloodEventSummary[];
  drains: DrainNode[];
  roads: RoadSegment[];
  water: WaterLevelReading[];
  reports: CitizenReport[];
  activeLayers: MapLayerKey[];
}

const WIDTH = 900;
const HEIGHT = 620;
const PAD = 40;

interface Projectable {
  latitude: number;
  longitude: number;
}

function project<T extends Projectable>(
  items: T[],
  viewport: { minLat: number; maxLat: number; minLon: number; maxLon: number },
): (T & { x: number; y: number })[] {
  const { minLat, maxLat, minLon, maxLon } = viewport;
  return items.map((item) => {
    const x =
      PAD + ((item.longitude - minLon) / (maxLon - minLon)) * (WIDTH - 2 * PAD);
    const y =
      HEIGHT -
      PAD -
      ((item.latitude - minLat) / (maxLat - minLat)) * (HEIGHT - 2 * PAD);
    return { ...item, x, y };
  });
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

export function MapFallback({
  events,
  drains,
  roads,
  water,
  reports,
  activeLayers,
}: MapFallbackProps) {
  const [hover, setHover] = useState<{ label: string; detail: string; x: number; y: number } | null>(null);

  const viewport = useMemo(() => {
    const lats = [13.06, 13.10];
    const lons = [80.25, 80.28];
    const push = (lat: number, lon: number) => {
      lats.push(lat);
      lons.push(lon);
    };
    for (const e of events) push(e.latitude, e.longitude);
    for (const d of drains) push(d.latitude, d.longitude);
    for (const r of reports) push(r.latitude, r.longitude);
    for (const w of water) push(w.latitude ?? 13.0827, w.longitude ?? 80.2707);
    return {
      minLat: Math.min(...lats) - 0.002,
      maxLat: Math.max(...lats) + 0.002,
      minLon: Math.min(...lons) - 0.002,
      maxLon: Math.max(...lons) + 0.002,
    };
  }, [events, drains, reports, water]);

  const pEvents = useMemo(() => project(events, viewport), [events, viewport]);
  const pDrains = useMemo(() => project(drains, viewport), [drains, viewport]);
  const pWater = useMemo(
    () =>
      project(
        water.map((w) => ({
          ...w,
          latitude: w.latitude ?? 13.0827,
          longitude: w.longitude ?? 80.2707,
        })),
        viewport,
      ),
    [water, viewport],
  );
  const pReports = useMemo(() => project(reports, viewport), [reports, viewport]);

  const show = (key: MapLayerKey) => activeLayers.includes(key);

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
        role="img"
        aria-label="Operational map projection"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="hsl(217 33% 20%)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        <rect
          width={WIDTH}
          height={HEIGHT}
          fill="hsl(222 47% 5%)"
        />
        <rect width={WIDTH} height={HEIGHT} fill="url(#grid)" />

        {show("roads") &&
          roads.map((road, i) => {
            const y = HEIGHT * 0.35 + i * 60;
            const isCritical = road.criticality === "critical";
            return (
              <g key={road.road_id}>
                <path
                  d={`M ${PAD + 40} ${y} Q ${WIDTH / 2} ${y - 28 * (i % 2 === 0 ? 1 : -1)} ${WIDTH - PAD - 40} ${y}`}
                  fill="none"
                  stroke={isCritical ? "#f97316" : "#64748b"}
                  strokeWidth={isCritical ? 3 : 1.5}
                  strokeDasharray={isCritical ? "8 4" : undefined}
                  opacity={0.55}
                >
                  <title>{`${road.name} (${road.road_type})`}</title>
                </path>
                <text
                  x={WIDTH / 2}
                  y={y + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isCritical ? "#f97316" : "#64748b"}
                >
                  {road.name}
                </text>
              </g>
            );
          })}

        {show("drains") &&
          pDrains.map((drain) => {
            const blocked = (drain.blockage_percent ?? 0) > 50;
            return (
              <g key={drain.drain_id}>
                <line
                  x1={drain.x}
                  y1={drain.y}
                  x2={drain.x + 18}
                  y2={drain.y - 12}
                  stroke={blocked ? "#ef4444" : "#3b82f6"}
                  strokeWidth={2}
                >
                  <title>{`${drain.drain_id}: ${drain.blockage_percent}% blocked`}</title>
                </line>
                <circle
                  cx={drain.x}
                  cy={drain.y}
                  r={5}
                  fill={blocked ? "#ef4444" : "#3b82f6"}
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHover({
                      label: drain.drain_id,
                      detail: `${drain.drain_type} · ${drain.blockage_percent}% blocked · condition ${drain.condition_score}/10`,
                      x: drain.x,
                      y: drain.y,
                    })
                  }
                  onMouseLeave={() => setHover(null)}
                />
              </g>
            );
          })}

        {show("water_levels") &&
          pWater.map((w) => {
            const critical = w.status === "critical" || w.water_level_m >= w.danger_level_m;
            const color = critical ? "#ef4444" : w.status === "warning" ? "#f97316" : "#22c55e";
            return (
              <g key={w.id}>
                <circle
                  cx={w.x}
                  cy={w.y}
                  r={critical ? 12 : 9}
                  fill={color}
                  fillOpacity={0.15}
                  stroke={color}
                  strokeWidth={1.5}
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHover({
                      label: `Water level ${w.water_level_m.toFixed(2)}m`,
                      detail: `Station ${w.station_id} · danger ${w.danger_level_m.toFixed(2)}m · ${w.status}`,
                      x: w.x,
                      y: w.y,
                    })
                  }
                  onMouseLeave={() => setHover(null)}
                />
                <circle cx={w.x} cy={w.y} r={3} fill={color} />
              </g>
            );
          })}

        {show("events") &&
          pEvents.map((event) => {
            const color = SEVERITY_COLORS[event.severity] ?? "#94a3b8";
            return (
              <g key={event.event_id}>
                <circle
                  cx={event.x}
                  cy={event.y}
                  r={14}
                  fill={color}
                  fillOpacity={0.15}
                  stroke={color}
                  strokeWidth={2}
                >
                  <title>{`${event.event_id} (${event.severity})`}</title>
                </circle>
                <circle cx={event.x} cy={event.y} r={6} fill={color} />
              </g>
            );
          })}

        {show("reports") &&
          pReports.map((report) => (
            <g key={report.report_id}>
              <path
                d={`M ${report.x} ${report.y - 10} l 6 10 l -12 0 z`}
                fill="#a855f7"
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHover({
                    label: report.report_id,
                    detail: report.description,
                    x: report.x,
                    y: report.y,
                  })
                }
                onMouseLeave={() => setHover(null)}
              />
            </g>
          ))}

        {hover && (
          <g pointerEvents="none">
            <rect
              x={hover.x + 16}
              y={Math.max(10, hover.y - 30)}
              width={300}
              height={46}
              rx={4}
              fill="hsl(222 47% 8%)"
              stroke="hsl(217 33% 25%)"
            />
            <text
              x={hover.x + 26}
              y={Math.max(26, hover.y - 14)}
              fill="hsl(210 40% 96%)"
              fontSize="13"
              fontWeight="600"
            >
              {hover.label}
            </text>
            <text
              x={hover.x + 26}
              y={Math.max(42, hover.y + 2)}
              fill="hsl(215 20% 65%)"
              fontSize="11"
            >
              {hover.detail.length > 42 ? `${hover.detail.slice(0, 42)}…` : hover.detail}
            </text>
          </g>
        )}

        <g fontSize="11" fill="hsl(215 20% 50%)">
          <text x={WIDTH - PAD} y={HEIGHT - 14} textAnchor="end">
            DEMO/SIMULATED · Zone J18, Chennai
          </text>
        </g>
      </svg>
    </div>
  );
}