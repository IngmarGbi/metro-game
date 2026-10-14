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

export default function LeafletMapInner({ guess, actual, disabled, onGuess }: Props) {
  return (
    <MapContainer
      center={PARIS_CENTER}
      zoom={12}
      minZoom={10}
      maxZoom={17}
      className="w-full h-full rounded-xl"
      attributionControl={false}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
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
