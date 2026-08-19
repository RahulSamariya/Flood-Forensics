"use client";

import { ArrowRight, Circle } from "lucide-react";
import { AGENT_PIPELINE } from "@/types";
import { cn } from "@/lib/utils";

export function AgentPipeline() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-2">
        {AGENT_PIPELINE.map((agent, index) => (
          <div key={agent.name} className="flex items-center gap-2 lg:flex-1">
            <AgentCard agent={agent} />
            {index < AGENT_PIPELINE.length - 1 && (
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground lg:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentCard({
  agent,
}: {
  agent: (typeof AGENT_PIPELINE)[number];
}) {
  return (
    <div className="flex flex-1 flex-col rounded-md border border-border bg-secondary/30 p-3">
      <div className="flex items-center gap-2">
        <Circle className="h-2 w-2 fill-muted-foreground text-muted-foreground" />
        <span className="text-sm font-medium">{agent.label}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{agent.description}</p>
      <div className="mt-2 flex items-center justify-between">
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-xs",
            "border border-border bg-background text-muted-foreground",
          )}
        >
          pending
        </span>
        <span className="text-xs text-muted-foreground">Phase {agent.phase}</span>
      </div>
    </div>
  );
}
