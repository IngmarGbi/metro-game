import { STATIONS } from "@/lib/stations";
import { buildSchematicDataset, type LinePathSegment } from "@/lib/schematicDataset";
import rawLinePaths from "@/data/linePaths.json";
import rawSupplementEdges from "@/data/metroSupplementEdges.json";
import type { LineEdge } from "@/lib/types";

const LINE_PATHS = rawLinePaths as LinePathSegment[];
// Straight-line stubs for stations not present on the real source map (newer
// extensions), connecting them to their real neighbour on the same line.
const SUPPLEMENT_EDGES = rawSupplementEdges as LineEdge[];

// Station positions and line geometry both come straight from a real schematic
// map (see src/data/linePaths.json's origin), already in SVG-native (y-down)
// orientation, so no flip is needed — unlike the open-data-derived coordinates
// the special dataset still uses.
export const METRO_DATASET = buildSchematicDataset(STATIONS, SUPPLEMENT_EDGES, {
  linePaths: LINE_PATHS,
  flipY: false,
});
