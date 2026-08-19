"use client";

import { useMemo, useState } from "react";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { TimelineEntry } from "@/types";

const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-primary/15 text-primary border-primary/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  action: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export function TimelineReplay({
  eventId,
  initialTimeline,
}: {
  eventId: string;
  initialTimeline?: TimelineEntry[];
}) {
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(-1);

  const reconstruct = useApi(() => api.events.reconstruct(eventId));
  const timeline = useMemo(
    () => (initialTimeline && initialTimeline.length > 0 ? initialTimeline : reconstruct.data?.timeline ?? []),
    [initialTimeline, reconstruct.data],
  );

  const play = () => {
    if (timeline.length === 0) return;
    setCursor(0);
    setPlaying(true);
    const interval = setInterval(() => {
      setCursor((prev) => {
        if (prev >= timeline.length - 1) {
          clearInterval(interval);
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
  };

  const reset = () => {
    setPlaying(false);
    setCursor(-1);
  };

  const visible = cursor >= 0 ? timeline.slice(0, cursor + 1) : timeline;

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Event Timeline</h2>
          <p className="text-xs text-muted-foreground">
            Reconstructed from rainfall, water levels, reports & response actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={play}
            disabled={playing || timeline.length === 0}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            {playing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Replay
          </button>
          <button
            onClick={reset}
            disabled={cursor < 0 && !playing}
            className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {reconstruct.loading && !initialTimeline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reconstructing event…
          </div>
        )}
        {timeline.length === 0 && !reconstruct.loading && (
          <div className="text-sm text-muted-foreground">
            No timeline data available. Run reconstruction to build one.
          </div>
        )}
        <ol className="relative space-y-3 border-l border-border pl-5">
          {visible.map((entry, i) => (
            <li key={`${entry.timestamp}-${i}`} className="relative">
              <span
                className={cn(
                  "absolute -left-[26px] top-1.5 h-2 w-2 rounded-full border",
                  SEVERITY_STYLES[entry.severity ?? "info"] ?? SEVERITY_STYLES.info,
                  cursor === i && "ring-2 ring-primary/40",
                )}
              />
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span
                  className={cn(
                    "rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
                    SEVERITY_STYLES[entry.severity ?? "info"] ?? SEVERITY_STYLES.info,
                  )}
                >
                  {entry.source ?? entry.severity}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-foreground">{entry.event}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}