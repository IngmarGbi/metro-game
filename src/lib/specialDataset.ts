import { SPECIAL_STATIONS, SPECIAL_LINE_EDGES } from "@/lib/specialStations";
import { buildSchematicDataset } from "@/lib/schematicDataset";

export const SPECIAL_DATASET = buildSchematicDataset(SPECIAL_STATIONS, SPECIAL_LINE_EDGES);
