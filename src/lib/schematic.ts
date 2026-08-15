import { STATIONS } from "@/lib/stations";

const PAD = 25;

const minX = Math.min(...STATIONS.map((s) => s.x));
const maxX = Math.max(...STATIONS.map((s) => s.x));
const minY = Math.min(...STATIONS.map((s) => s.y));
const maxY = Math.max(...STATIONS.map((s) => s.y));

export const SCHEMATIC_BOUNDS = { minX, maxX, minY, maxY };

export const VIEW_BOX = {
  x: minX - PAD,
  y: 0,
  width: maxX - minX + PAD * 2,
  height: maxY - minY + PAD * 2,
};

/** Data y grows northward; SVG y grows downward, so flip it to draw north-up. */
export function toSvg(x: number, y: number): { x: number; y: number } {
  return { x, y: maxY - y + PAD };
}
