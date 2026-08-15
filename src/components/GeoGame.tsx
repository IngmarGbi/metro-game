"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import GeoMap from "@/components/GeoMap";
import StationBadges from "@/components/StationBadges";
import { pickRandomStations } from "@/lib/stations";
import { haversineKm, geoScore } from "@/lib/geo";
import type { Station } from "@/lib/types";

const ROUNDS = 5;

interface RoundResult {
  station: Station;
  guess: { lat: number; lon: number };
  distanceKm: number;
  points: number;
}

export default function GeoGame() {
  const [rounds, setRounds] = useState<Station[]>(() => pickRandomStations(ROUNDS));
  const [roundIndex, setRoundIndex] = useState(0);
  const [guess, setGuess] = useState<{ lat: number; lon: number } | null>(null);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [history, setHistory] = useState<RoundResult[]>([]);

  const target = rounds[roundIndex];
  const gameOver = roundIndex >= rounds.length;
  const totalScore = history.reduce((acc, r) => acc + r.points, 0);

  const handlePlacePin = useCallback(
    (lat: number, lon: number) => {
      if (!target || result) return;
      setGuess({ lat, lon });
    },
    [target, result]
  );

  const handleValidate = useCallback(() => {
    if (!target || !guess || result) return;
    const distanceKm = haversineKm(guess.lat, guess.lon, target.lat, target.lon);
    const points = geoScore(distanceKm);
    setResult({ station: target, guess, distanceKm, points });
  }, [target, guess, result]);

  const nextRound = () => {
    if (result) setHistory((h) => [...h, result]);
    setGuess(null);
    setResult(null);
    setRoundIndex((i) => i + 1);
  };

  const restart = () => {
    setRounds(pickRandomStations(ROUNDS));
    setRoundIndex(0);
    setGuess(null);
    setResult(null);
    setHistory([]);
  };

  const finalScore = useMemo(
    () => history.reduce((acc, r) => acc + r.points, 0) + (result ? result.points : 0),
    [history, result]
  );

  if (gameOver) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold">Partie terminée !</h2>
        <p className="text-slate-300">
          Score final : <span className="text-2xl font-bold text-orange-400">{finalScore}</span> / {ROUNDS * 5000}
        </p>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {history.map((r, i) => (
            <div key={i} className="flex justify-between text-sm bg-slate-800/60 rounded px-3 py-1.5">
              <span>{r.station.name}</span>
              <span className="text-slate-400">{r.distanceKm.toFixed(2)} km · {r.points} pts</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={restart} className="px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-400 font-semibold">
            Rejouer
          </button>
          <Link href="/" className="px-5 py-2 rounded-full bg-slate-700 hover:bg-slate-600 font-semibold">
            Accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>Manche {roundIndex + 1} / {ROUNDS}</span>
        <span>Score : <span className="font-semibold text-orange-400">{totalScore}</span></span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-bold text-center">{target.name}</h2>
        <StationBadges lines={target.lines} />
        <p className="text-slate-400 text-sm">
          Clique sur la carte pour placer ton repère, puis valide ta réponse.
        </p>
      </div>

      <div className="h-[60vh] min-h-[360px] w-full">
        <GeoMap
          guess={guess}
          actual={result ? { lat: target.lat, lon: target.lon } : null}
          disabled={!!result}
          onGuess={handlePlacePin}
        />
      </div>

      <div className="min-h-[76px] flex items-center justify-center">
        {result ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg">
              Distance : <span className="font-semibold">{result.distanceKm.toFixed(2)} km</span> · +
              <span className="font-semibold text-orange-400">{result.points}</span> points
            </p>
            <button
              onClick={nextRound}
              className="px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-400 font-semibold"
            >
              {roundIndex + 1 < ROUNDS ? "Manche suivante" : "Voir le score final"}
            </button>
          </div>
        ) : guess ? (
          <button
            onClick={handleValidate}
            className="px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-400 font-semibold"
          >
            Valider ma réponse
          </button>
        ) : (
          <p className="text-slate-500 text-sm">En attente de ton clic…</p>
        )}
      </div>
    </div>
  );
}
