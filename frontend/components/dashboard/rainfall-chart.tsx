"use client";

import { CloudRain, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useRainfall } from "@/hooks/use-api";

export function RainfallChart() {
  const { data, loading, error } = useRainfall();

  const chartData = (data ?? []).map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    rainfall: r.rainfall_mm,
    intensity: r.rainfall_intensity_mm_hr,
  }));

  return (
    <div className="flex h-[260px] flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <CloudRain className="h-4 w-4 text-primary" />
        <div>
          <h2 className="text-sm font-semibold">Rainfall</h2>
          <p className="text-xs text-muted-foreground">Station MET-N12 · 15 Jul 2026</p>
        </div>
      </div>
      <div className="flex-1 p-3">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <p className="text-xs text-severity-high">{error}</p>
        )}
        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                axisLine={{ stroke: "hsl(217 33% 17%)" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                axisLine={{ stroke: "hsl(217 33% 17%)" }}
                unit=" mm"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 47% 8%)",
                  border: "1px solid hsl(217 33% 17%)",
                  borderRadius: "6px",
                  fontSize: 12,
                  color: "hsl(210 40% 96%)",
                }}
                formatter={(value: number) => [`${value} mm`, "Rainfall"]}
              />
              <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "Heavy", fontSize: 10, fill: "#ef4444" }} />
              <Bar dataKey="rainfall" fill="hsl(199 89% 48%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
