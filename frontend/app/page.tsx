"use client";

import { AlertTriangle, MapPin, Shield, TrendingUp } from "lucide-react";
import { CommanderPanel } from "@/components/dashboard/commander-panel";
import { IncidentSummary } from "@/components/dashboard/incident-summary";
import { OperationalMap } from "@/components/map/operational-map";
import { RecentEvents } from "@/components/dashboard/recent-events";
import { StatCard } from "@/components/ui/stat-card";
import { useApi } from "@/hooks/use-api";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const events = useApi(() => api.events.list());
  const recommendations = useApi(() => api.recommendations.list("F2026-001"));

  const activeCount = events.data?.length ?? 0;
  const criticalCount =
    events.data?.filter((e) => e.severity === "critical").length ?? 0;
  const hotspotCount = activeCount; // all demo events recur in zone J18

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Top stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Active Incidents"
          value={events.loading ? "…" : String(activeCount)}
          icon={AlertTriangle}
          variant="critical"
          hint="DEMO/SIMULATED"
        />
        <StatCard
          label="Critical Zones"
          value={events.loading ? "…" : String(criticalCount)}
          icon={MapPin}
          variant="high"
          hint="Zone J18"
        />
        <StatCard
          label="Resilience Score"
          value={recommendations.loading ? "…" : "—"}
          icon={Shield}
          variant="default"
          hint="Computed in Phase 10"
        />
        <StatCard
          label="Recurring Hotspots"
          value={events.loading ? "…" : String(hotspotCount)}
          icon={TrendingUp}
          variant="medium"
          hint="J18 recurrence"
        />
      </div>

      {/* Main command center layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <IncidentSummary />
        </aside>
        <main className="lg:col-span-6">
          <OperationalMap />
        </main>
        <aside className="lg:col-span-3">
          <CommanderPanel />
        </aside>
      </div>

      {/* Bottom panel */}
      <div className="h-56 shrink-0">
        <RecentEvents />
      </div>
    </div>
  );
}