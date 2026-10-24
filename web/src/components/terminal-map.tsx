"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export function TerminalMap({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    (async () => {
      const L = (await import("leaflet")).default;
      if (!ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false }).setView([lat, lng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.circleMarker([lat, lng], { radius: 9, color: "#1e6b3c", fillColor: "#f2c230", fillOpacity: 1, weight: 3 })
        .addTo(map)
        .bindPopup(name);
    })();
    return () => {
      map?.remove();
    };
  }, [lat, lng, name]);
  return <div ref={ref} className="h-64 w-full rounded-sm border border-line" aria-label={`Map of ${name}`} />;
}
