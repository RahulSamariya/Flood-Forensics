"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { api } from "@/lib/api";
import type { CommanderResponse } from "@/types";

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

  return (
    <div className="flex h-[460px] flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Urban Resilience Commander</h2>
        <p className="text-xs text-muted-foreground">Ask the City</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {response ? (
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">{response.incident_brief}</p>
            {response.confidence > 0 && (
              <p className="text-xs text-muted-foreground">
                Confidence: {Math.round(response.confidence * 100)}%
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Example queries:</p>
            <ul className="space-y-1 text-xs">
              <li>&ldquo;Why did J18 flood?&rdquo;</li>
              <li>&ldquo;Has this happened before?&rdquo;</li>
              <li>&ldquo;What should we fix first?&rdquo;</li>
            </ul>
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
