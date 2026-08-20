"use client";

import { ArrowRight, Circle, Loader2, Play } from "lucide-react";
import { useState } from "react";
import { AGENT_PIPELINE } from "@/types";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { AgentFinding } from "@/types";

export function AgentPipeline() {
  const [findings, setFindings] = useState<AgentFinding[] | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPipeline = async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await api.commander.analyze({ event_id: "F2026-001" });
      setFindings(result.agent_findings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pipeline failed");
    } finally {
      setRunning(false);
    }
  };

  const statusFor = (name: string) => {
    if (!findings) return "pending";
    const match = findings.find((f) => f.agent_name === name);
    return match ? "completed" : "pending";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => void runPipeline()}
          disabled={running}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          Run full pipeline
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-2">
          {AGENT_PIPELINE.map((agent, index) => {
            const status = statusFor(agent.name);
            return (
              <div key={agent.name} className="flex items-center gap-2 lg:flex-1">
                <AgentCard agent={agent} status={status} />
                {index < AGENT_PIPELINE.length - 1 && (
                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground lg:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-severity-high">{error}</p>}

      {findings && findings.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Agent Findings</h2>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {findings.map((finding, i) => (
              <div
                key={i}
                className="rounded border border-border bg-secondary/40 p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 font-mono text-[11px] uppercase",
                      finding.confidence >= 0.7
                        ? "border border-emerald-500/30 text-emerald-400"
                        : finding.confidence >= 0.4
                          ? "border border-amber-500/30 text-amber-400"
                          : "border border-severity-critical/30 text-severity-critical",
                    )}
                  >
                    {finding.agent_name.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {finding.finding_type}
                  </span>
                </div>
                <p className="mt-2 text-foreground">{finding.finding}</p>
                {finding.evidence.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {finding.evidence.map((ev, j) => (
                      <p key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <span className="mt-0.5 text-primary">•</span>
                        <span>
                          <span className="font-mono">
                            [{ev.source} · {ev.reference}]
                          </span>{" "}
                          {ev.description}
                        </span>
                      </p>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Confidence: {Math.round(finding.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AgentCard({
  agent,
  status,
}: {
  agent: (typeof AGENT_PIPELINE)[number];
  status: string;
}) {
  return (
    <div className="flex flex-1 flex-col rounded-md border border-border bg-secondary/30 p-3">
      <div className="flex items-center gap-2">
        <Circle
          className={cn(
            "h-2 w-2",
            status === "completed" ? "fill-emerald-400 text-emerald-400" : "fill-muted-foreground text-muted-foreground",
          )}
        />
        <span className="text-sm font-medium">{agent.label}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{agent.description}</p>
      <div className="mt-2 flex items-center justify-between">
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-xs",
            status === "completed"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-border bg-background text-muted-foreground",
          )}
        >
          {status}
        </span>
        <span className="text-xs text-muted-foreground">Phase {agent.phase}</span>
      </div>
    </div>
  );
}