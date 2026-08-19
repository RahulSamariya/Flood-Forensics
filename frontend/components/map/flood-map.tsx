"use client";

import { useEffect, useRef, useState } from "react";
import { Layers, Loader2, MapPin } from "lucide-react";
import { useEvents, useDrains, useCitizenReports } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

const LAYER_OPTIONS = [
  { id: "events", label: "Flood Events", color: "#ef4444" },
  { id: "drains", label: "Drainage", color: "#3b82f6" },
  { id: "reports", label: "Citizen Reports", color: "#f59e0b" },
] as const;

type LayerId = (typeof LAYER_OPTIONS)[number]["id"];

export function FloodMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeLayers, setActiveLayers] = useState<Set<LayerId>>(
    new Set(["events", "drains", "reports"])
  );

  const { data: events } = useEvents();
  const { data: drains } = useDrains();
  const { data: reports } = useCitizenReports("F2026-001");
  const [mapReady, setMapReady] = useState(false);

  function toggleLayer(id: LayerId) {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix Leaflet default icon issues in bundlers
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      L.Marker.prototype.options.icon = icon;

      const map = L.map(mapRef.current!, {
        center: [23.0338, 72.5630],
        zoom: 14,
        zoomControl: false,
      });

      // Dark tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when data or layers change
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const importLeaflet = async () => {
      const L = (await import("leaflet")).default;

      // Clear existing layers (keep tile layer)
      map.eachLayer((layer: any) => {
        if (layer._url === undefined || layer._url?.includes("carto") === false) {
          if (!layer._url) map.removeLayer(layer);
        }
      });

      // Divide the map area into localized zones using polygons & labels
      const zonesData = [
        {
          name: "Navrangpura Zone (N12)",
          color: "#3b82f6",
          coords: [
            [23.042, 72.553],
            [23.042, 72.570],
            [23.025, 72.570],
            [23.025, 72.553]
          ] as [number, number][],
        },
        {
          name: "Vastrapur Zone (V07)",
          color: "#10b981",
          coords: [
            [23.042, 72.535],
            [23.042, 72.553],
            [23.025, 72.553],
            [23.025, 72.535]
          ] as [number, number][],
        },
        {
          name: "Satellite Zone (S09)",
          color: "#8b5cf6",
          coords: [
            [23.025, 72.535],
            [23.025, 72.553],
            [23.010, 72.553],
            [23.010, 72.535]
          ] as [number, number][],
        }
      ];

      zonesData.forEach((zone) => {
        const poly = L.polygon(zone.coords, {
          color: zone.color,
          weight: 1.5,
          opacity: 0.4,
          fillColor: zone.color,
          fillOpacity: 0.04,
          dashArray: "4 6",
        }).addTo(map);

        poly.bindTooltip(zone.name, {
          permanent: true,
          direction: "center",
          className: "bg-transparent border-0 text-[10px] text-muted-foreground font-semibold font-sans opacity-60 pointer-events-none",
        });
      });

      // Flood events
      if (activeLayers.has("events") && events) {
        events.forEach((e) => {
          const severityColor: Record<string, string> = {
            critical: "#ef4444",
            high: "#f97316",
            medium: "#eab308",
            low: "#22c55e",
          };
          const color = severityColor[e.severity] ?? "#ef4444";
          L.circleMarker([e.latitude, e.longitude], {
            radius: e.severity === "critical" ? 14 : e.severity === "high" ? 11 : 8,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.35,
          })
            .bindPopup(
              `<div style="font-family:system-ui;font-size:12px;"><strong>${e.event_id}</strong><br/>` +
              `Severity: <span style="color:${color};font-weight:600">${e.severity.toUpperCase()}</span><br/>` +
              `Depth: ${e.water_depth_cm ?? "—"} cm<br/>` +
              `Zone: ${e.zone_id ?? "—"}<br/>` +
              `${new Date(e.event_date).toLocaleDateString("en-IN")}</div>`
            )
            .addTo(map);
        });
      }

      // Drains
      if (activeLayers.has("drains") && drains) {
        drains.forEach((d) => {
          const blockage = d.blockage_percent ?? 0;
          const color = blockage > 60 ? "#ef4444" : blockage > 30 ? "#f59e0b" : "#3b82f6";
          L.circleMarker([d.latitude, d.longitude], {
            radius: 6,
            fillColor: color,
            color: "#1e3a5f",
            weight: 1.5,
            fillOpacity: 0.7,
          })
            .bindPopup(
              `<div style="font-family:system-ui;font-size:12px;"><strong>${d.drain_id}</strong> (${d.drain_type})<br/>` +
              `Blockage: <strong style="color:${color}">${blockage}%</strong><br/>` +
              `Capacity: ${d.capacity_m3_s ?? "—"} m³/s<br/>` +
              `Condition: ${d.condition_score ?? "—"}/100</div>`
            )
            .addTo(map);
        });

        // Draw drain connections
        if (drains.length > 1) {
          const drainMap = new Map(drains.map((d) => [d.drain_id, d]));
          const connections = [
            ["D140", "D141"],
            ["D141", "D142"],
            ["D142", "D143"],
            ["D143", "D144"],
          ];
          connections.forEach(([from, to]) => {
            const f = drainMap.get(from);
            const t = drainMap.get(to);
            if (f && t) {
              L.polyline(
                [[f.latitude, f.longitude], [t.latitude, t.longitude]],
                { color: "#3b82f6", weight: 1.5, opacity: 0.4, dashArray: "4 6" }
              ).addTo(map);
            }
          });
        }
      }

      // Citizen reports
      if (activeLayers.has("reports") && reports) {
        reports.forEach((r) => {
          const icon = L.divIcon({
            className: "",
            html: `<div style="width:10px;height:10px;background:#f59e0b;border-radius:2px;border:1.5px solid #92400e;transform:rotate(45deg);"></div>`,
            iconSize: [10, 10],
            iconAnchor: [5, 5],
          });
          L.marker([r.latitude, r.longitude], { icon })
            .bindPopup(
              `<div style="font-family:system-ui;font-size:12px;"><strong>${r.report_id}</strong><br/>` +
              `${r.description.slice(0, 80)}…<br/>` +
              `Depth: ${r.water_depth_cm} cm · ${r.severity.toUpperCase()}</div>`
            )
            .addTo(map);
        });
      }
    };

    importLeaflet();
  }, [mapReady, events, drains, reports, activeLayers]);

  return (
    <div className="flex h-[460px] flex-col rounded-lg border border-border bg-card">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold">Operational Map</h2>
            <p className="text-xs text-muted-foreground">
              Zone N12 · Navrangpura, Ahmedabad
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-sans">
          {LAYER_OPTIONS.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => toggleLayer(id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors",
                activeLayers.has(id)
                  ? "border-border bg-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-accent/50"
              )}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: color, opacity: activeLayers.has(id) ? 1 : 0.3 }}
              />
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="relative h-[400px] w-full">
        <div ref={mapRef} className="h-full w-full rounded-b-lg" />
        {!mapReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
