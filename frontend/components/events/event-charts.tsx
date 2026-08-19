"use client";

import { Loader2 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import type { RainfallReading, WaterLevelReading } from "@/types";

export function RainfallChart({ eventId }: { eventId: string }) {
  const { data, loading, error } = useApi(() => api.events.rainfall(eventId));

  if (loading)
    return <ChartShell title="Rainfall Intensity"><Loading /></ChartShell>;
  if (error)
    return <ChartShell title="Rainfall Intensity"><Error msg={error} /></ChartShell>;

  const chartData = (data ?? []).map((r: RainfallReading) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    mm: r.rainfall_mm,
    intensity: r.rainfall_intensity_mm_hr,
  }));

  return (
    <ChartShell title="Rainfall Intensity (mm/hr)">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="rainFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(217 33% 20%)" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="hsl(215 20% 55%)" fontSize={10} />
          <YAxis stroke="hsl(215 20% 55%)" fontSize={10} />
          <Tooltip
            contentStyle={{
              background: "hsl(222 47% 8%)",
              border: "1px solid hsl(217 33% 25%)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="intensity"
            stroke="#3b82f6"
            fill="url(#rainFill)"
            strokeWidth={2}
            name="mm/hr"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function WaterLevelChart({ eventId }: { eventId: string }) {
  const { data, loading, error } = useApi(() => api.events.waterLevels(eventId));

  if (loading)
    return <ChartShell title="Water Level"><Loading /></ChartShell>;
  if (error)
    return <ChartShell title="Water Level"><Error msg={error} /></ChartShell>;

  const chartData = (data ?? []).map((w: WaterLevelReading) => ({
    time: new Date(w.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    level: w.water_level_m,
    danger: w.danger_level_m,
  }));

  return (
    <ChartShell title="Water Level (m) vs Danger">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(217 33% 20%)" strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="hsl(215 20% 55%)" fontSize={10} />
          <YAxis stroke="hsl(215 20% 55%)" fontSize={10} />
          <Tooltip
            contentStyle={{
              background: "hsl(222 47% 8%)",
              border: "1px solid hsl(217 33% 25%)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="level"
            stroke="#22c55e"
            fill="url(#waterFill)"
            strokeWidth={2}
            name="level (m)"
          />
          <Area
            type="monotone"
            dataKey="danger"
            stroke="#ef4444"
            strokeDasharray="5 4"
            fill="none"
            name="danger (m)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

function ChartShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-[180px] flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-2">
        <h3 className="text-xs font-semibold">{title}</h3>
      </div>
      <div className="min-h-0 flex-1 p-2">{children}</div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
    </div>
  );
}

function Error({ msg }: { msg: string }) {
  return <div className="p-4 text-sm text-severity-high">{msg}</div>;
}