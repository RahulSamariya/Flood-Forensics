import { api } from "@/lib/api";
import { TimelineReplay } from "@/components/events/timeline-replay";
import { RainfallChart, WaterLevelChart } from "@/components/events/event-charts";
import { EventEvidence } from "@/components/events/event-evidence";
import { cn } from "@/lib/utils";

const SEVERITY_BADGE: Record<string, string> = {
  critical: "border-severity-critical/40 text-severity-critical",
  high: "border-severity-high/40 text-severity-high",
  medium: "border-severity-medium/40 text-severity-medium",
  low: "border-severity-low/40 text-severity-low",
};

export default async function EventInvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await api.events.get(id);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Flood Event Investigation — {event.event_id}
          </h1>
          <p className="text-sm text-muted-foreground">
            {event.city} · Zone {event.zone_id ?? "—"} ·{" "}
            {new Date(event.event_date).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded border px-2 py-1 text-xs uppercase",
              SEVERITY_BADGE[event.severity] ?? "text-muted-foreground",
            )}
          >
            {event.severity}
          </span>
          <span className="rounded border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground">
            {event.water_depth_cm != null
              ? `${event.water_depth_cm} cm peak depth`
              : "depth n/a"}
          </span>
          <span className="rounded border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground">
            {event.duration_minutes ?? "—"} min duration
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TimelineReplay eventId={id} />
        <div className="flex flex-col gap-4">
          <RainfallChart eventId={id} />
          <WaterLevelChart eventId={id} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventEvidence eventId={id} />
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Event Facts
          </h3>
          <dl className="space-y-2">
            <FactRow label="Affected area" value={`${event.affected_area_km2 ?? "—"} km²`} />
            <FactRow label="Affected population" value={event.affected_population?.toLocaleString() ?? "—"} />
            <FactRow label="Source" value={event.source} />
            <FactRow label="Confidence" value={`${event.confidence != null ? Math.round(event.confidence * 100) : "—"}%`} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}