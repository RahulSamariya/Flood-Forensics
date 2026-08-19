"use client";

import { useState } from "react";
import { ArrowDown, Loader2, Zap } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { RankedCause } from "@/types";

const CAUSE_LABELS: Record<string, string> = {
  drainage_blockage: "Drainage Blockage",
  insufficient_capacity: "Insufficient Capacity",
  excessive_rainfall: "Excessive Rainfall",
  low_elevation: "Low Elevation",
  maintenance_failure: "Maintenance Failure",
  pump_failure: "Pump Failure",
  downstream_obstruction: "Downstream Obstruction",
};

const CAUSAL_CHAIN = [
  { step: "Rainfall", detail: "Peak intensity 68 mm/hr" },
  { step: "Drain blockage", detail: "D142 at 71%" },
  { step: "Capacity exceeded", detail: "Effective flow < inflow" },
  { step: "Water accumulation", detail: "Peak 1.86m (danger 1.5m)" },
  { step: "Road flooding", detail: "J18 Market Road" },
];

export function RootCausePanel({ eventId }: { eventId: string }) {
  const { data, loading, error, refetch } = useApi(() =>
    api.agents.rootCause(eventId),
  );
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Root Cause Analysis</h3>
          <p className="text-xs text-muted-foreground">
            Ranked causes with supporting evidence
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Zap className="h-3.5 w-3.5" />
          )}
          Analyze
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-auto p-4">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Analyzing causes…
          </div>
        )}
        {error && <p className="text-sm text-severity-high">{error}</p>}

        {data && (
          <>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Causal Chain
              </div>
              <div className="flex flex-col items-stretch gap-1">
                {CAUSAL_CHAIN.map((node, i) => (
                  <div key={node.step}>
                    <div className="rounded border border-border bg-secondary/40 px-3 py-2 text-sm">
                      <span className="font-medium">{node.step}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {node.detail}
                      </span>
                    </div>
                    {i < CAUSAL_CHAIN.length - 1 && (
                      <ArrowDown className="mx-auto my-0.5 h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Ranked Causes</span>
                <span>confidence {Math.round((data.confidence ?? 0) * 100)}%</span>
              </div>
              <ul className="space-y-2">
                {data.ranked_causes.map((cause, i) => (
                  <CauseRow
                    key={cause.cause}
                    cause={cause}
                    index={i}
                    expanded={expanded === i}
                    onToggle={() =>
                      setExpanded(expanded === i ? null : i)
                    }
                  />
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CauseRow({
  cause,
  index,
  expanded,
  onToggle,
}: {
  cause: RankedCause;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const pct = Math.round(cause.probability * 100);
  return (
    <li className="overflow-hidden rounded border border-border bg-secondary/30">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 font-mono text-xs text-primary">
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-medium">
          {CAUSE_LABELS[cause.cause] ?? cause.cause}
        </span>
        <span className="w-24">
          <div className="h-1.5 overflow-hidden rounded bg-border">
            <div
              className={cn(
                "h-full rounded",
                pct >= 40
                  ? "bg-severity-critical"
                  : pct >= 20
                    ? "bg-severity-high"
                    : "bg-severity-medium",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </span>
        <span className="w-10 text-right font-mono text-xs text-muted-foreground">
          {pct}%
        </span>
      </button>
      {expanded && (
        <div className="border-t border-border px-3 py-3 text-sm">
          <p className="text-foreground">{cause.explanation}</p>
          {cause.supporting_evidence.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="text-xs font-medium uppercase tracking-wider text-emerald-400/70">
                Supporting evidence
              </div>
              {cause.supporting_evidence.map((ev, i) => (
                <p key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 shrink-0 text-emerald-400">+</span>
                  <span>
                    <span className="font-mono text-muted-foreground">
                      [{ev.source} · {ev.reference}]
                    </span>{" "}
                    {ev.description}
                  </span>
                </p>
              ))}
            </div>
          )}
          {cause.contradicting_evidence.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="text-xs font-medium uppercase tracking-wider text-severity-high/70">
                Contradicting evidence
              </div>
              {cause.contradicting_evidence.map((ev, i) => (
                <p key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 shrink-0 text-severity-high">−</span>
                  <span>
                    <span className="font-mono text-muted-foreground">
                      [{ev.source} · {ev.reference}]
                    </span>{" "}
                    {ev.description}
                  </span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}