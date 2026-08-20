"use client";

import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Loader2,
  MessageSquare,
  Send,
  Shield,
} from "lucide-react";
import { api } from "@/lib/api";
import type { AgentFinding, CommanderResponse } from "@/types";
import { cn } from "@/lib/utils";

export function CommanderPanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CommanderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await api.commander.analyze({ query: query.trim() });
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function analyzeEvent() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.commander.analyze({ event_id: "F2026-001" });
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Urban Resilience Commander</h2>
        <p className="text-xs text-muted-foreground">Ask the City · agent orchestration</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!response && !loading && (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Ask about any flood event or run the full pipeline.</p>
            <button
              onClick={() => void analyzeEvent()}
              className="flex w-full items-center justify-between rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/20"
            >
              <span className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                Analyze F2026-001
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <div className="pt-1">
              <p className="mb-1 text-xs">Example queries:</p>
              <ul className="space-y-1 text-xs">
                <li>&ldquo;Why did J18 flood?&rdquo;</li>
                <li>&ldquo;Has this happened before?&rdquo;</li>
                <li>&ldquo;What should we fix first?&rdquo;</li>
              </ul>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Running agent pipeline…
          </div>
        )}

        {response && (
          <div className="space-y-3">
            <div className="rounded border border-border bg-secondary/40 p-3">
              <p className="text-sm leading-relaxed text-foreground">
                {response.incident_brief}
              </p>
            </div>

            {response.primary_cause && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Primary cause
                </span>
                <span className="font-medium text-severity-high">
                  {response.primary_cause.replace(/_/g, " ")}
                </span>
              </div>
            )}

            {response.resilience_score != null && (
              <div className="rounded border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                    <Shield className="h-3.5 w-3.5" /> Resilience score
                  </span>
                  <span className="font-mono text-lg font-semibold">
                    {Math.round(response.resilience_score)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-border">
                  <div
                    className={cn(
                      "h-full rounded",
                      response.resilience_score >= 60
                        ? "bg-severity-low"
                        : response.resilience_score >= 35
                          ? "bg-severity-medium"
                          : "bg-severity-critical",
                    )}
                    style={{ width: `${response.resilience_score}%` }}
                  />
                </div>
              </div>
            )}

            {response.recommended_intervention && (
              <div className="text-sm">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Recommended intervention
                </span>
                <p className="mt-0.5 text-foreground">
                  {response.recommended_intervention}
                </p>
              </div>
            )}

            {response.recurrence_summary && (
              <div className="text-sm">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Recurrence
                </span>
                <p className="mt-0.5 text-foreground">{response.recurrence_summary}</p>
              </div>
            )}

            {response.agent_findings.length > 0 && (
              <div className="space-y-1.5 border-t border-border pt-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Agent findings
                </p>
                {response.agent_findings.map((finding, i) => (
                  <AgentFindingRow key={i} finding={finding} />
                ))}
              </div>
            )}

            {response.confidence > 0 && (
              <p className="text-xs text-muted-foreground">
                Overall confidence: {Math.round(response.confidence * 100)}%
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-severity-high">{error}</p>
        )}
      </div>

      <form
        onSubmit={handleAsk}
        className="border-t border-border p-3"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MessageSquare className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the City…"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none ring-ring focus:ring-1"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function AgentFindingRow({ finding }: { finding: AgentFinding }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span
        className={cn(
          "mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase",
          finding.confidence >= 0.7
            ? "border border-emerald-500/30 text-emerald-400"
            : finding.confidence >= 0.4
              ? "border border-amber-500/30 text-amber-400"
              : "border border-severity-critical/30 text-severity-critical",
        )}
      >
        {finding.agent_name.replace(/_/g, " ")}
      </span>
      <span className="text-muted-foreground">{finding.finding}</span>
    </div>
  );
}