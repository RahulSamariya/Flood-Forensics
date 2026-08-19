"use client";

import Link from "next/link";
import { Loader2, TrendingUp, Wrench } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export function RecentEvents() {
  const events = useApi(() => api.events.list());
  const recommendations = useApi(() => api.recommendations.list("F2026-001"));

  const loading = events.loading || recommendations.loading;

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Recent Events & Recommendations</h2>
        <p className="text-xs text-muted-foreground">
          Recurrence history · Permanent fix proposals (DEMO/SIMULATED)
        </p>
      </div>
      <div className="grid h-[calc(100%-3rem)] grid-cols-1 gap-4 overflow-auto p-4 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Event History
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <ul className="space-y-2">
              {(events.data ?? []).map((event) => (
                <li
                  key={event.event_id}
                  className="flex items-center justify-between rounded border border-border bg-secondary/40 px-3 py-2 text-sm"
                >
                  <Link
                    href={`/events/${event.event_id}`}
                    className="font-mono hover:text-primary"
                  >
                    {event.event_id}
                  </Link>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(event.event_date).toLocaleDateString()}</span>
                    <span
                      className={cn(
                        "uppercase",
                        event.severity === "critical"
                          ? "text-severity-critical"
                          : event.severity === "high"
                            ? "text-severity-high"
                            : "text-severity-medium",
                      )}
                    >
                      {event.severity}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Wrench className="h-3.5 w-3.5" />
            AI Recommendations
          </div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <ul className="space-y-2">
              {(recommendations.data ?? []).map((rec) => (
                <li
                  key={rec.id}
                  className="rounded border border-border bg-secondary/40 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{rec.title}</span>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[11px] uppercase",
                        rec.priority === "high"
                          ? "border border-severity-critical/40 text-severity-critical"
                          : "border border-severity-medium/40 text-severity-medium",
                      )}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      ₹{rec.estimated_cost?.toLocaleString() ?? "—"}
                    </span>
                    <span>
                      risk ↓{" "}
                      {rec.expected_risk_reduction != null
                        ? `${Math.round(rec.expected_risk_reduction * 100)}%`
                        : "—"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}