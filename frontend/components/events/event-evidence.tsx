"use client";

import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export function EventEvidence({ eventId }: { eventId: string }) {
  const reconstruct = useApi(() => api.events.reconstruct(eventId));

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Evidence</h3>
        <p className="text-xs text-muted-foreground">
          Source-backed references collected during reconstruction
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {reconstruct.loading && (
          <p className="text-sm text-muted-foreground">Loading evidence…</p>
        )}
        {reconstruct.error && (
          <p className="text-sm text-severity-high">{reconstruct.error}</p>
        )}
        {reconstruct.data && reconstruct.data.evidence.length === 0 && (
          <p className="text-sm text-muted-foreground">No evidence recorded.</p>
        )}
        <ul className="space-y-2">
          {(reconstruct.data?.evidence ?? []).map((ev, i) => (
            <li
              key={i}
              className="rounded border border-border bg-secondary/40 px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[11px] uppercase",
                    ev.source === "rainfall" || ev.source === "water_levels"
                      ? "border border-blue-500/30 text-blue-400"
                      : ev.source === "citizen_reports"
                        ? "border border-purple-500/30 text-purple-400"
                        : "border border-emerald-500/30 text-emerald-400",
                  )}
                >
                  {ev.source.replace("_", " ")}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {ev.reference}
                </span>
              </div>
              <p className="mt-1 text-foreground">{ev.description}</p>
              {ev.value != null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Value: <span className="font-mono">{ev.value}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}