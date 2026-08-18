import rawStations from "@/data/stations.json";
import rawEdges from "@/data/lineEdges.json";
import type { Station, LineEdge } from "@/lib/types";

export const STATIONS = rawStations as Station[];
export const LINE_EDGES = rawEdges as LineEdge[];

export const STATIONS_BY_ID: Record<string, Station> = Object.fromEntries(
  STATIONS.map((s) => [s.id, s])
);

/** Fisher-Yates shuffle, pure (does not mutate input). */
export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandomStations(count: number, pool: Station[] = STATIONS): Station[] {
  return shuffle(pool).slice(0, count);
}
