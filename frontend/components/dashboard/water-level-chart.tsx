"use client";

import { Waves, Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useWaterLevels } from "@/hooks/use-api";

export function WaterLevelChart() {
  const { data, loading, error } = useWaterLevels();

  const dangerLevel = data?.[0]?.danger_level_m ?? 3.5;

  const chartData = (data ?? []).map((wl) => ({
    time: new Date(wl.timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    level: wl.water_level_m,
    flow: wl.flow_rate_m3_s,
    status: wl.status,
  }));

  return (
    <div className="flex h-[260px] flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Waves className="h-4 w-4 text-primary" />
        <div>
          <h2 className="text-sm font-semibold">Water Level</h2>
          <p className="text-xs text-muted-foreground">Station WL-NALA-N12 · Danger: {dangerLevel}m</p>
        </div>
      </div>
      <div className="flex-1 p-3">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && <p className="text-xs text-severity-high">{error}</p>}
        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                axisLine={{ stroke: "hsl(217 33% 17%)" }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                axisLine={{ stroke: "hsl(217 33% 17%)" }}
                unit=" m"
                domain={[0, 5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 47% 8%)",
                  border: "1px solid hsl(217 33% 17%)",
                  borderRadius: "6px",
                  fontSize: 12,
                  color: "hsl(210 40% 96%)",
                }}
                formatter={(value: number, name: string) => [
                  `${value}${name === "level" ? " m" : " m³/s"}`,
                  name === "level" ? "Water Level" : "Flow Rate",
                ]}
              />
              <ReferenceLine
                y={dangerLevel}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "DANGER", fontSize: 10, fill: "#ef4444" }}
              />
              <Area
                type="monotone"
                dataKey="level"
                stroke="hsl(199 89% 48%)"
                fill="url(#waterGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
