import { AgentPipeline } from "@/components/agents/agent-pipeline";

export default function AgentsPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight">Agent Console</h1>
        <p className="text-sm text-muted-foreground">
          Pipeline status, evidence, findings, and confidence for each agent.
        </p>
      </header>
      <AgentPipeline />
    </div>
  );
}
