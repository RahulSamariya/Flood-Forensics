"use client";

import Link from "next/link";
import { AlertCircle, AlertTriangle, Loader2, ChevronRight } from "lucide-react";
import { useEvents } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

const severityConfig: Record<string, { dot: string; bg: string; text: string }> = {
  critical: { dot: "bg-severity-critical", bg: "bg-severity-critical/10 border-severity-critical/30", text: "text-severity-critical" },
  high: { dot: "bg-severity-high", bg: "bg-severity-high/10 border-severity-high/30", text: "text-severity-high" },
  medium: { dot: "bg-severity-medium", bg: "bg-severity-medium/10 border-severity-medium/30", text: "text-severity-medium" },
  low: { dot: "bg-severity-low", bg: "bg-severity-low/10 border-severity-low/30", text: "text-severity-low" },
};

export function IncidentSummary() {
  const { data, loading, error } = useEvents();

  return (
    <div className="flex h-[460px] flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Incident Summary</h2>
        <p className="text-xs text-muted-foreground">
          {data ? `${data.length} event${data.length !== 1 ? "s" : ""} tracked` : "Active flood investigations"}
        </p>
      </div>
      <div className="flex-1 overflow-auto p-3">
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
          <p className="text-sm text-muted-foreground">No events found.</p>
        )}
        {data && data.length > 0 && (
          <ul className="space-y-2">
            {data.map((event) => {
              const sev = severityConfig[event.severity] ?? severityConfig.low;
              return (
                <li key={event.event_id}>
                  <Link
                    href={`/events/${event.event_id}`}
                    className="group flex items-start gap-3 rounded-md border border-border bg-secondary/30 p-3 transition-colors hover:bg-accent/50"
                  >
                    <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", sev.dot)} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{event.event_id}</span>
                        <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase", sev.bg, sev.text)}>
                          {event.severity}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.city} · Zone {event.zone_id ?? "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {event.water_depth_cm != null && ` · ${event.water_depth_cm} cm depth`}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
