"use client";

import { MapContainer, TileLayer, CircleMarker, Polyline, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const PARIS_CENTER: [number, number] = [48.8566, 2.3522];

interface Guess {
  lat: number;
  lon: number;
}

interface Props {
  guess: Guess | null;
  actual: { lat: number; lon: number } | null;
  disabled: boolean;
  onGuess: (lat: number, lon: number) => void;
}

function ClickCatcher({ disabled, onGuess }: { disabled: boolean; onGuess: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onGuess(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// CARTO's Positron style has no POI/station icons at any zoom, unlike OSM's
// standard style, so it needs no zoom cap to hide the answer. Falls back to
// OSM (capped lower, to limit how much it gives away) until the key is set.
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY;
const TILE_URL = CARTO_KEY
  ? `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`
  : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = CARTO_KEY
  ? '&copy; OpenStreetMap contributors &copy; CARTO'
  : '&copy; OpenStreetMap contributors';
const TILE_MAX_ZOOM = CARTO_KEY ? 17 : 15;

export default function LeafletMapInner({ guess, actual, disabled, onGuess }: Props) {
  return (
    <MapContainer
      center={PARIS_CENTER}
      zoom={12}
      minZoom={10}
      maxZoom={TILE_MAX_ZOOM}
      className="w-full h-full rounded-xl"
      attributionControl={false}
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
      <ClickCatcher disabled={disabled} onGuess={onGuess} />
      {guess && (
        <CircleMarker
          center={[guess.lat, guess.lon]}
          radius={8}
          pathOptions={{ color: "#1e293b", fillColor: "#3b82f6", fillOpacity: 1, weight: 2 }}
        />
      )}
      {actual && (
        <CircleMarker
          center={[actual.lat, actual.lon]}
          radius={8}
          pathOptions={{ color: "#1e293b", fillColor: "#22c55e", fillOpacity: 1, weight: 2 }}
        />
      )}
      {guess && actual && (
        <Polyline
          positions={[
            [guess.lat, guess.lon],
            [actual.lat, actual.lon],
          ]}
          pathOptions={{ color: "#f97316", weight: 2, dashArray: "6 6" }}
        />
      )}
    </MapContainer>
  );
}
