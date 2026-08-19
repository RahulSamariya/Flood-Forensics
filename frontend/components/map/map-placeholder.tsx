"use client";

import { Map } from "lucide-react";

export function MapPlaceholder() {
  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Operational Map</h2>
          <p className="text-xs text-muted-foreground">
            Flood events · Drainage · Water levels
          </p>
        </div>
        <span className="text-xs text-muted-foreground">Mapbox GL — Phase 4</span>
      </div>
      <div className="relative flex flex-1 items-center justify-center bg-secondary/30">
        <div className="text-center">
          <Map className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">
            Interactive map loads with Mapbox token
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground/60">
            NEXT_PUBLIC_MAPBOX_TOKEN
          </p>
        </div>
        {/* Grid overlay for command-center aesthetic */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>
    </div>
  );
}
