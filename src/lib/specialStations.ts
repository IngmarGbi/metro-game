import rawStations from "@/data/specialStations.json";
import rawEdges from "@/data/specialLineEdges.json";
import type { Station, LineEdge } from "@/lib/types";

export const SPECIAL_STATIONS = rawStations as Station[];
export const SPECIAL_LINE_EDGES = rawEdges as LineEdge[];
