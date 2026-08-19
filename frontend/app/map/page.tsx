export default function MapPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Geospatial Map</h1>
      <p className="max-w-lg text-sm text-muted-foreground">
        Layered view: flood events, drainage, roads, water levels, hotspots, critical
        infrastructure.
      </p>
      <span className="rounded border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
        Phase 4 — Mapbox GL integration
      </span>
    </div>
  );
}
