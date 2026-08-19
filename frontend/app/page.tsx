"use client";

import { AlertTriangle, MapPin, Shield, TrendingUp, DollarSign, Users, FileCheck, Activity } from "lucide-react";
import { CommanderPanel } from "@/components/dashboard/commander-panel";
import { IncidentSummary } from "@/components/dashboard/incident-summary";
import { FloodMap } from "@/components/map/flood-map";
import { RecentEvents } from "@/components/dashboard/recent-events";
import { StatCard } from "@/components/ui/stat-card";
import { RainfallChart } from "@/components/dashboard/rainfall-chart";
import { WaterLevelChart } from "@/components/dashboard/water-level-chart";
import { useDashboardStats } from "@/hooks/use-api";

export default function DashboardPage() {
  const { data: stats } = useDashboardStats();

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Top stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Active Incidents"
          value={stats ? String(stats.active_incidents) : "—"}
          icon={AlertTriangle}
          variant="critical"
        />
        <StatCard
          label="Critical Zones"
          value={stats ? String(stats.critical_zones) : "—"}
          icon={MapPin}
          variant="high"
        />
        <StatCard
          label="Resilience Score"
          value={stats ? `${stats.resilience_score}%` : "—"}
          icon={Shield}
          variant="default"
        />
        <StatCard
          label="Recurring Hotspots"
          value={stats ? String(stats.recurring_hotspots) : "—"}
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
          <FloodMap />
        </main>
        <aside className="lg:col-span-3">
          <CommanderPanel />
        </aside>
      </div>

      {/* Bottom panel — Charts and recent events */}
      <div className="grid min-h-[220px] grid-cols-1 gap-4 lg:grid-cols-3">
        <RainfallChart />
        <WaterLevelChart />
        <RecentEvents />
      </div>
    </div>
  );
}
