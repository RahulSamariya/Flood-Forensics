"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEvents } from "@/hooks/use-api";

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
              <li
                key={event.event_id}
                className="rounded border border-border bg-secondary/50 p-3 text-sm"
              >
                <div className="font-medium">{event.event_id}</div>
                <div className="text-xs text-muted-foreground">{event.city}</div>
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
