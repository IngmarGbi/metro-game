import type { Station, LineEdge } from "@/lib/types";

export interface SchematicPoint {
  id: string;
  name: string;
  lines: string[];
  sx: number;
  sy: number;
}

export interface SchematicDataset {
  edges: LineEdge[];
  points: SchematicPoint[];
  pointsById: Record<string, SchematicPoint>;
  viewBox: { x: number; y: number; width: number; height: number };
  nearest(x: number, y: number): SchematicPoint;
}

const PAD = 25;

/** Builds a renderable schematic map (points + edges + viewBox) from a station/edge set.
 * Data y grows northward; SVG y grows downward, so it gets flipped to draw north-up. */
export function buildSchematicDataset(stations: Station[], edges: LineEdge[]): SchematicDataset {
  const minX = Math.min(...stations.map((s) => s.x));
  const maxX = Math.max(...stations.map((s) => s.x));
  const minY = Math.min(...stations.map((s) => s.y));
  const maxY = Math.max(...stations.map((s) => s.y));

  const points: SchematicPoint[] = stations.map((s) => ({
    id: s.id,
    name: s.name,
    lines: s.lines,
    sx: s.x,
    sy: maxY - s.y + PAD,
  }));
  const pointsById = Object.fromEntries(points.map((p) => [p.id, p]));

  function nearest(x: number, y: number): SchematicPoint {
    let best = points[0];
    let bestDist = Infinity;
    for (const p of points) {
      const d = (p.sx - x) ** 2 + (p.sy - y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return best;
  }

  return {
    edges,
    points,
    pointsById,
    viewBox: { x: minX - PAD, y: 0, width: maxX - minX + PAD * 2, height: maxY - minY + PAD * 2 },
    nearest,
  };
}
