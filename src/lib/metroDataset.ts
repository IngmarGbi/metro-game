import { STATIONS, LINE_EDGES } from "@/lib/stations";
import { buildSchematicDataset } from "@/lib/schematicDataset";

export const METRO_DATASET = buildSchematicDataset(STATIONS, LINE_EDGES);
