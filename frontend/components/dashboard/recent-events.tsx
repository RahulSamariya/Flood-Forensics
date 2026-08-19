"use client";

import { Lightbulb, Loader2, AlertCircle, ArrowUpRight } from "lucide-react";
import { useRecommendations } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

const priorityColor: Record<string, string> = {
  critical: "text-severity-critical border-severity-critical/30 bg-severity-critical/10",
  high: "text-severity-high border-severity-high/30 bg-severity-high/10",
  medium: "text-severity-medium border-severity-medium/30 bg-severity-medium/10",
  low: "text-severity-low border-severity-low/30 bg-severity-low/10",
};

function formatCost(cost: number | null | undefined): string {
  if (cost == null) return "—";
  if (cost >= 10_000_000) return `₹${(cost / 10_000_000).toFixed(1)} Cr`;
  if (cost >= 100_000) return `₹${(cost / 100_000).toFixed(1)} L`;
  return `₹${cost.toLocaleString("en-IN")}`;
}

export function RecentEvents() {
  const { data: recs, loading, error } = useRecommendations();

  return (
    <div className="flex h-[260px] flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Lightbulb className="h-4 w-4 text-severity-medium" />
        <div>
          <h2 className="text-sm font-semibold">AI Recommendations</h2>
          <p className="text-xs text-muted-foreground">Proposed interventions</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-xs text-severity-high">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
        {!loading && !error && recs && recs.length > 0 && (
          <ul className="space-y-2">
            {recs.slice(0, 4).map((rec) => (
              <li
                key={rec.id}
                className="group flex items-start gap-2 rounded-md border border-border bg-secondary/20 p-2.5 transition-colors hover:bg-accent/30"
              >
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium leading-tight">{rec.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase",
                        priorityColor[rec.priority] ?? priorityColor.medium,
                      )}
                    >
                      {rec.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatCost(rec.estimated_cost)}
                    </span>
                    {rec.expected_risk_reduction != null && (
                      <span className="text-[10px] text-severity-low">
                        -{Math.round(rec.expected_risk_reduction * 100)}% risk
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && !error && (!recs || recs.length === 0) && (
          <p className="py-4 text-center text-sm text-muted-foreground">No recommendations yet.</p>
        )}
      </div>
    </div>
  );
}
