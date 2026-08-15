"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import SchematicMap from "@/components/SchematicMap";
import StationBadges from "@/components/StationBadges";
import { pickRandomStations } from "@/lib/stations";
import type { Station } from "@/lib/types";

const ROUNDS = 5;
const MAX_ATTEMPTS = 3;

interface RoundResult {
  station: Station;
  points: number;
}

export default function SchematicGame() {
  const [rounds, setRounds] = useState<Station[]>(() => pickRandomStations(ROUNDS));
  const [roundIndex, setRoundIndex] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [wrongGuessIds, setWrongGuessIds] = useState<string[]>([]);
  const [resolved, setResolved] = useState(false);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [coloredLines, setColoredLines] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  const target = rounds[roundIndex];
  const gameOver = roundIndex >= rounds.length;
  const totalScore = history.reduce((acc, r) => acc + r.points, 0);

  const handleSelectStation = (stationId: string) => {
    if (resolved || !target) return;
    setSelectedStationId(stationId);
  };

  const handleValidate = () => {
    if (resolved || !target || !selectedStationId) return;
    if (selectedStationId === target.id) {
      const points = attemptsLeft;
      setLastPoints(points);
      setResolved(true);
      return;
    }
    setWrongGuessIds((prev) => (prev.includes(selectedStationId) ? prev : [...prev, selectedStationId]));
    setSelectedStationId(null);
    const remaining = attemptsLeft - 1;
    setAttemptsLeft(remaining);
    if (remaining <= 0) {
      setLastPoints(0);
      setResolved(true);
    }
  };

  const nextRound = () => {
    setHistory((h) => [...h, { station: target, points: lastPoints ?? 0 }]);
    setRoundIndex((i) => i + 1);
    setAttemptsLeft(MAX_ATTEMPTS);
    setWrongGuessIds([]);
    setResolved(false);
    setLastPoints(null);
    setSelectedStationId(null);
  };

  const restart = () => {
    setRounds(pickRandomStations(ROUNDS));
    setRoundIndex(0);
    setAttemptsLeft(MAX_ATTEMPTS);
    setWrongGuessIds([]);
    setResolved(false);
    setLastPoints(null);
    setHistory([]);
    setSelectedStationId(null);
  };

  const finalScore = useMemo(
    () => history.reduce((acc, r) => acc + r.points, 0) + (resolved ? lastPoints ?? 0 : 0),
    [history, resolved, lastPoints]
  );

  if (gameOver) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold">Partie terminée !</h2>
        <p className="text-slate-300">
          Score final : <span className="text-2xl font-bold text-orange-400">{finalScore}</span> / {ROUNDS * MAX_ATTEMPTS}
        </p>
        <div className="flex flex-col gap-2 w-full max-w-sm">
          {history.map((r, i) => (
            <div key={i} className="flex justify-between text-sm bg-slate-800/60 rounded px-3 py-1.5">
              <span>{r.station.name}</span>
              <span className="text-slate-400">{r.points} pts</span>
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
        <div className="flex items-center gap-1.5">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < attemptsLeft ? "bg-orange-400" : "bg-slate-700"
              }`}
            />
          ))}
        </div>
        <p className="text-slate-400 text-sm">
          Clique sur une station pour la sélectionner, puis valide ta réponse ({attemptsLeft} tentative
          {attemptsLeft > 1 ? "s" : ""} restante{attemptsLeft > 1 ? "s" : ""}).
        </p>
      </div>

      <div className="h-[60vh] min-h-[400px] w-full">
        <SchematicMap
          disabled={resolved}
          correctStationId={target.id}
          wrongGuessIds={wrongGuessIds}
          selectedStationId={selectedStationId}
          revealCorrect={resolved}
          coloredLines={coloredLines}
          onToggleColoredLines={() => setColoredLines((v) => !v)}
          onSelectStation={handleSelectStation}
        />
      </div>

      <div className="min-h-[76px] flex items-center justify-center">
        {resolved ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg">
              {lastPoints && lastPoints > 0 ? (
                <>Bravo ! +<span className="font-semibold text-orange-400">{lastPoints}</span> points</>
              ) : (
                <>Dommage, la bonne réponse est mise en évidence en vert.</>
              )}
            </p>
            <button
              onClick={nextRound}
              className="px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-400 font-semibold"
            >
              {roundIndex + 1 < ROUNDS ? "Manche suivante" : "Voir le score final"}
            </button>
          </div>
        ) : selectedStationId ? (
          <button
            onClick={handleValidate}
            className="px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-400 font-semibold"
          >
            Valider ma réponse
          </button>
        ) : (
          <p className="text-slate-500 text-sm">
            {wrongGuessIds.length > 0 ? "Raté, essaie encore !" : "Sélectionne une station sur le plan…"}
          </p>
        )}
      </div>
    </div>
  );
}
