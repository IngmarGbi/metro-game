import { STATIONS } from "@/lib/stations";
import { toSvg } from "@/lib/schematic";

export interface SchematicStation {
  id: string;
  name: string;
  lines: string[];
  sx: number;
  sy: number;
}

export const SCHEMATIC_STATIONS: SchematicStation[] = STATIONS.map((s) => {
  const { x, y } = toSvg(s.x, s.y);
  return { id: s.id, name: s.name, lines: s.lines, sx: x, sy: y };
});

export const SCHEMATIC_STATIONS_BY_ID: Record<string, SchematicStation> =
  Object.fromEntries(SCHEMATIC_STATIONS.map((s) => [s.id, s]));

export function nearestSchematicStation(x: number, y: number): SchematicStation {
  let best = SCHEMATIC_STATIONS[0];
  let bestDist = Infinity;
  for (const s of SCHEMATIC_STATIONS) {
    const d = (s.sx - x) ** 2 + (s.sy - y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
}
