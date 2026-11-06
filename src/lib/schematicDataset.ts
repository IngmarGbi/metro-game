import type { Station, LineEdge } from "@/lib/types";

export interface SchematicPoint {
  id: string;
  name: string;
  lines: string[];
  sx: number;
  sy: number;
}

/** A real line-route path lifted verbatim from a source map, rendered as-is
 * (with its own affine transform) instead of a straight edge between stations. */
export interface LinePathSegment {
  line: string;
  d: string;
  /** 2D affine [a, b, c, d, e, f], i.e. SVG's matrix(a,b,c,d,e,f). */
  matrix: [number, number, number, number, number, number];
}

export interface SchematicDataset {
  edges: LineEdge[];
  linePaths: LinePathSegment[];
  points: SchematicPoint[];
  pointsById: Record<string, SchematicPoint>;
  viewBox: { x: number; y: number; width: number; height: number };
  nearest(x: number, y: number): SchematicPoint;
}

const PAD = 25;

interface BuildOptions {
  linePaths?: LinePathSegment[];
  /** Source y grows northward by default, opposite of SVG's downward y, so it's
   * flipped to draw north-up. Sources already in SVG-native orientation (y down)
   * should pass false. */
  flipY?: boolean;
}

/** Builds a renderable schematic map (points + edges/paths + viewBox) from a station set. */
export function buildSchematicDataset(
  stations: Station[],
  edges: LineEdge[],
  options: BuildOptions = {}
): SchematicDataset {
  const { linePaths = [], flipY = true } = options;

  const minX = Math.min(...stations.map((s) => s.x));
  const maxX = Math.max(...stations.map((s) => s.x));
  const maxY = Math.max(...stations.map((s) => s.y));

  const points: SchematicPoint[] = stations.map((s) => ({
    id: s.id,
    name: s.name,
    lines: s.lines,
    sx: s.x,
    sy: flipY ? maxY - s.y + PAD : s.y,
  }));
  const pointsById = Object.fromEntries(points.map((p) => [p.id, p]));

  const minSy = Math.min(...points.map((p) => p.sy));
  const maxSy = Math.max(...points.map((p) => p.sy));

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
    linePaths,
    points,
    pointsById,
    viewBox: { x: minX - PAD, y: minSy - PAD, width: maxX - minX + PAD * 2, height: maxSy - minSy + PAD * 2 },
    nearest,
  };
}
