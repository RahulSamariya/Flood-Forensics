"use client";

import { useState } from "react";
import { Dna, Loader2, Repeat } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { FloodDNA, SimilarEvent } from "@/types";

export function RecurrenceAnalysis({ eventId }: { eventId: string }) {
  const { data, loading, error, refetch } = useApi(() =>
    api.agents.recurrence(eventId),
  );
  const [running, setRunning] = useState(false);

  const handleAnalyze = async () => {
    setRunning(true);
    await refetch();
    setRunning(false);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Recurrence Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            Flood DNA profiles, similar event search, and historical comparison.
          </p>
        </div>
        <button
          onClick={() => void handleAnalyze()}
          disabled={loading || running}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading || running ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Repeat className="h-3.5 w-3.5" />
          )}
          Run analysis
        </button>
      </header>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Computing Flood DNA…
        </div>
      )}
      {error && <p className="text-sm text-severity-high">{error}</p>}

      {data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <FloodDNAPanel dna={data.flood_dna} confidence={data.confidence} />
          </div>
          <div className="lg:col-span-3">
            <SimilarEventsPanel events={data.similar_events} />
          </div>
        </div>
      )}
    </div>
  );
}

function FloodDNAPanel({
  dna,
  confidence,
}: {
  dna?: FloodDNA | null;
  confidence: number;
}) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Dna className="h-4 w-4 text-primary" />
        <div>
          <h2 className="text-sm font-semibold">Flood DNA</h2>
          <p className="text-xs text-muted-foreground">
            Zone J18 recurrence signature · confidence {Math.round(confidence * 100)}%
          </p>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-auto p-4">
        {!dna && <p className="text-sm text-muted-foreground">Insufficient evidence.</p>}
        {dna && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Rainfall threshold"
                value={`${dna.rainfall_threshold_mm ?? "—"} mm/hr`}
              />
              <Metric
                label="Critical duration"
                value={`${dna.critical_duration_minutes ?? "—"} min`}
              />
              <Metric
                label="Recurrence count"
                value={String(dna.recurrence_count)}
              />
              <Metric
                label="Avg recovery"
                value={
                  dna.average_recovery_minutes != null
                    ? `${Math.round(dna.average_recovery_minutes / 60 * 10) / 10} h`
                    : "—"
                }
              />
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Common causes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dna.common_causes.map((c) => (
                  <span
                    key={c}
                    className="rounded border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary"
                  >
                    {c.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Vulnerable infrastructure
              </div>
              <ul className="space-y-1">
                {dna.vulnerable_infrastructure.map((infra) => (
                  <li
                    key={infra}
                    className="flex items-center gap-2 rounded border border-severity-high/30 bg-severity-high/5 px-2 py-1 font-mono text-xs text-severity-high"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-severity-high" />
                    {infra}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-secondary/40 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-sm font-medium">{value}</div>
    </div>
  );
}

function SimilarEventsPanel({ events }: { events: SimilarEvent[] }) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Similar Historical Events</h2>
        <p className="text-xs text-muted-foreground">
          Ranked by similarity score across location, depth, duration, and severity
        </p>
      </div>
      <div className="flex-1 space-y-2 overflow-auto p-4">
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">No similar events found.</p>
        )}
        {events.map((event) => (
          <div
            key={event.event_id}
            className="rounded border border-border bg-secondary/40 p-3 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-medium">{event.event_id}</span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[11px] uppercase",
                  event.severity === "high"
                    ? "border border-severity-high/40 text-severity-high"
                    : "border border-severity-medium/40 text-severity-medium",
                )}
              >
                {event.severity}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {new Date(event.event_date).toLocaleDateString()} ·{" "}
              {event.water_depth_cm != null
                ? `${event.water_depth_cm} cm`
                : "depth n/a"}
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded bg-border">
                <div
                  className="h-full rounded bg-primary"
                  style={{ width: `${Math.min(100, event.similarity_score * 100)}%` }}
                />
              </div>
              <span className="font-mono text-xs text-primary">
                {Math.round(event.similarity_score * 100)}%
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {event.shared_factors.map((factor) => (
                <span
                  key={factor}
                  className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}