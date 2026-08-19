import { OperationalMap } from "@/components/map/operational-map";

export default function MapPage() {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight">Geospatial Map</h1>
        <p className="text-sm text-muted-foreground">
          Layered view: flood events, drainage, roads, water levels, and citizen
          reports for zone J18.
        </p>
      </header>
      <div className="min-h-0 flex-1">
        <OperationalMap />
      </div>
    </div>
  );
}