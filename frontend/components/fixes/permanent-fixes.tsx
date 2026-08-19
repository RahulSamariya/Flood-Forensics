"use client";

import { useMemo, useState } from "react";
import { Loader2, Wrench } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Intervention } from "@/types";

const PRIORITY_STYLES: Record<string, string> = {
  high: "border-severity-critical/40 text-severity-critical",
  medium: "border-severity-high/40 text-severity-high",
  low: "border-severity-medium/40 text-severity-medium",
};

export function PermanentFixesPage() {
  const { data, loading, error, refetch } = useApi(() =>
    api.agents.permanentFix("F2026-001"),
  );
  const [running, setRunning] = useState(false);

  const chartData = useMemo(() => {
    const items = data
      ? [...data.immediate_response, ...data.permanent_interventions]
      : [];
    return items.map((i) => ({
      name: i.intervention.length > 28 ? `${i.intervention.slice(0, 28)}…` : i.intervention,
      cost: i.estimated_cost ?? 0,
      impact: Math.round((i.expected_risk_reduction ?? 0) * 100),
      full: i.intervention,
    }));
  }, [data]);

  const handleRun = async () => {
    setRunning(true);
    await refetch();
    setRunning(false);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Permanent Fixes</h1>
          <p className="text-sm text-muted-foreground">
            Recommended interventions with cost, risk reduction, and priority.
          </p>
        </div>
        <button
          onClick={() => void handleRun()}
          disabled={loading || running}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading || running ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wrench className="h-3.5 w-3.5" />
          )}
          Generate options
        </button>
      </header>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating interventions…
        </div>
      )}
      {error && <p className="text-sm text-severity-high">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <InterventionList
              title="Immediate Response"
              items={data.immediate_response}
              accent="border-severity-critical/40"
            />
            <InterventionList
              title="Permanent Interventions"
              items={data.permanent_interventions}
              accent="border-primary/40"
            />
          </div>

          <div className="h-72 rounded-lg border border-border bg-card p-4">
            <h3 className="text-xs font-semibold">Cost vs Impact</h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Estimated cost (bars) vs expected risk reduction (%). Lower cost,
              higher impact = best value.
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
              >
                <CartesianGrid stroke="hsl(217 33% 20%)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(215 20% 55%)"
                  fontSize={10}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis
                  yAxisId="cost"
                  stroke="hsl(215 20% 55%)"
                  fontSize={10}
                />
                <YAxis
                  yAxisId="impact"
                  orientation="right"
                  stroke="hsl(215 20% 55%)"
                  fontSize={10}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222 47% 8%)",
                    border: "1px solid hsl(217 33% 25%)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar yAxisId="cost" dataKey="cost" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="impact" dataKey="impact" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function InterventionList({
  title,
  items,
  accent,
}: {
  title: string;
  items: Intervention[];
  accent: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <ul className="flex-1 space-y-2 p-4">
        {items.length === 0 && (
          <li className="text-sm text-muted-foreground">No options generated.</li>
        )}
        {items.map((item, i) => (
          <li
            key={i}
            className="rounded border border-border bg-secondary/40 p-3 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium">{item.intervention}</p>
              <span
                className={cn(
                  "shrink-0 rounded border px-1.5 py-0.5 text-[11px] uppercase",
                  PRIORITY_STYLES[item.priority] ?? "text-muted-foreground",
                )}
              >
                {item.priority}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Cost</div>
                <div className="font-mono">
                  ₹{item.estimated_cost?.toLocaleString() ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Risk ↓</div>
                <div className="font-mono">
                  {item.expected_risk_reduction != null
                    ? `${Math.round(item.expected_risk_reduction * 100)}%`
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Time</div>
                <div className="font-mono">
                  {item.implementation_time_days != null
                    ? `${item.implementation_time_days}d`
                    : "—"}
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Confidence {Math.round(item.confidence * 100)}%
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}