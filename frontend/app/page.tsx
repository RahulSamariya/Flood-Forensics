import { AlertTriangle, MapPin, Shield, TrendingUp } from "lucide-react";
import { CommanderPanel } from "@/components/dashboard/commander-panel";
import { IncidentSummary } from "@/components/dashboard/incident-summary";
import { MapPlaceholder } from "@/components/map/map-placeholder";
import { RecentEvents } from "@/components/dashboard/recent-events";
import { StatCard } from "@/components/ui/stat-card";

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Top stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Active Incidents"
          value="—"
          icon={AlertTriangle}
          variant="critical"
          hint="Phase 2: F2026-001 demo"
        />
        <StatCard
          label="Critical Zones"
          value="—"
          icon={MapPin}
          variant="high"
        />
        <StatCard
          label="Resilience Score"
          value="—"
          icon={Shield}
          variant="default"
        />
        <StatCard
          label="Recurring Hotspots"
          value="—"
          icon={TrendingUp}
          variant="medium"
        />
      </div>

      {/* Main command center layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <IncidentSummary />
        </aside>
        <main className="lg:col-span-6">
          <MapPlaceholder />
        </main>
        <aside className="lg:col-span-3">
          <CommanderPanel />
        </aside>
      </div>

      {/* Bottom panel */}
      <div className="h-48 shrink-0">
        <RecentEvents />
      </div>
    </div>
  );
}
