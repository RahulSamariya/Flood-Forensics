"use client";

import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEvents } from "@/hooks/use-api";
import { cn, severityColor } from "@/lib/utils";

const SEVERITY_BADGE: Record<string, string> = {
  critical: "border-severity-critical/40 text-severity-critical",
  high: "border-severity-high/40 text-severity-high",
  medium: "border-severity-medium/40 text-severity-medium",
  low: "border-severity-low/40 text-severity-low",
};

export function IncidentSummary() {
  const { data, loading, error } = useEvents();

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Incident Summary</h2>
        <p className="text-xs text-muted-foreground">Active flood investigations</p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading incidents…
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 text-sm text-severity-high">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {!loading && !error && data?.length === 0 && (
          <EmptyState />
        )}
        {data && data.length > 0 && (
          <ul className="space-y-2">
            {data.map((event) => (
              <li key={event.event_id}>
                <Link
                  href={`/events/${event.event_id}`}
                  className="block rounded border border-border bg-secondary/50 p-3 text-sm transition-colors hover:border-primary/40 hover:bg-secondary"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{event.event_id}</span>
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[11px] uppercase",
                        SEVERITY_BADGE[event.severity] ?? "text-muted-foreground",
                      )}
                    >
                      {event.severity}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {event.city} · Zone {event.zone_id ?? "—"}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className={severityColor(event.severity)}>
                      {event.water_depth_cm != null
                        ? `${event.water_depth_cm} cm`
                        : "depth n/a"}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(event.event_date).toLocaleString()}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      <p>No active incidents loaded.</p>
      <p className="text-xs">
        Demo event <span className="font-mono text-primary">F2026-001</span> will
        appear after Phase 2 seed data.
      </p>
    </div>
  );
}