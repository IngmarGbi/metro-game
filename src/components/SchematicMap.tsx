"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { VIEW_BOX } from "@/lib/schematic";
import { SCHEMATIC_STATIONS, nearestSchematicStation } from "@/lib/schematicStations";
import { LINE_EDGES } from "@/lib/stations";
import { SCHEMATIC_STATIONS_BY_ID } from "@/lib/schematicStations";
import { lineColor } from "@/data/lineColors";

interface Props {
  disabled: boolean;
  correctStationId: string | null;
  wrongGuessIds: string[];
  selectedStationId: string | null;
  revealCorrect: boolean;
  coloredLines: boolean;
  onToggleColoredLines: () => void;
  onSelectStation: (stationId: string) => void;
}

const MIN_SCALE = 0.7;
const MAX_SCALE = 8;
const DRAG_THRESHOLD = 5;
const NEUTRAL_LINE_COLOR = "#475569";

export default function SchematicMap({
  disabled,
  correctStationId,
  wrongGuessIds,
  selectedStationId,
  revealCorrect,
  coloredLines,
  onToggleColoredLines,
  onSelectStation,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ scale: 1.6, tx: -180, ty: -80 });
  const drag = useRef<{
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
    moved: boolean;
    pointerId: number;
  } | null>(null);

  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    const p = getSvgPoint(e.clientX, e.clientY);
    drag.current = {
      startX: p.x,
      startY: p.y,
      startTx: transform.tx,
      startTy: transform.ty,
      moved: false,
      pointerId: e.pointerId,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const p = getSvgPoint(e.clientX, e.clientY);
    const dx = p.x - drag.current.startX;
    const dy = p.y - drag.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) {
      drag.current.moved = true;
    }
    setTransform((t) => ({
      ...t,
      tx: drag.current!.startTx + dx,
      ty: drag.current!.startTy + dy,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    drag.current = null;
    if (disabled || !d || d.moved) return;
    const p = getSvgPoint(e.clientX, e.clientY);
    const localX = (p.x - transform.tx) / transform.scale;
    const localY = (p.y - transform.ty) / transform.scale;
    const nearest = nearestSchematicStation(localX, localY);
    onSelectStation(nearest.id);
  };

  const zoomBy = useCallback((factor: number, center?: { x: number; y: number }) => {
    setTransform((t) => {
      const cx = center?.x ?? VIEW_BOX.x + VIEW_BOX.width / 2;
      const cy = center?.y ?? VIEW_BOX.y + VIEW_BOX.height / 2;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor));
      const contentX = (cx - t.tx) / t.scale;
      const contentY = (cy - t.ty) / t.scale;
      return {
        scale: newScale,
        tx: cx - contentX * newScale,
        ty: cy - contentY * newScale,
      };
    });
  }, []);

  // Native (non-passive) listener: React's onWheel is passive, so preventDefault()
  // there throws instead of stopping the page from scrolling while we zoom.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const p = getSvgPoint(e.clientX, e.clientY);
      zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2, p);
    };
    svg.addEventListener("wheel", handler, { passive: false });
    return () => svg.removeEventListener("wheel", handler);
  }, [getSvgPoint, zoomBy]);

  return (
    <div className="relative w-full h-full touch-none select-none">
      <svg
        ref={svgRef}
        viewBox={`${VIEW_BOX.x} ${VIEW_BOX.y} ${VIEW_BOX.width} ${VIEW_BOX.height}`}
        className="w-full h-full bg-slate-950 rounded-xl cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <g transform={`translate(${transform.tx} ${transform.ty}) scale(${transform.scale})`}>
          {LINE_EDGES.map((edge, i) => {
            const a = SCHEMATIC_STATIONS_BY_ID[edge.a];
            const b = SCHEMATIC_STATIONS_BY_ID[edge.b];
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.sx}
                y1={a.sy}
                x2={b.sx}
                y2={b.sy}
                stroke={coloredLines ? lineColor(edge.line) : NEUTRAL_LINE_COLOR}
                strokeWidth={1.4}
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}

          {SCHEMATIC_STATIONS.map((s) => (
            <circle
              key={s.id}
              cx={s.sx}
              cy={s.sy}
              r={1.6}
              fill="#0f172a"
              stroke="#e2e8f0"
              strokeWidth={0.6}
            />
          ))}

          {wrongGuessIds.map((id) => {
            const s = SCHEMATIC_STATIONS_BY_ID[id];
            if (!s) return null;
            return (
              <g key={id}>
                <circle cx={s.sx} cy={s.sy} r={3.2} fill="none" stroke="#ef4444" strokeWidth={1} />
                <line x1={s.sx - 2.2} y1={s.sy - 2.2} x2={s.sx + 2.2} y2={s.sy + 2.2} stroke="#ef4444" strokeWidth={1} />
                <line x1={s.sx - 2.2} y1={s.sy + 2.2} x2={s.sx + 2.2} y2={s.sy - 2.2} stroke="#ef4444" strokeWidth={1} />
              </g>
            );
          })}

          {selectedStationId && SCHEMATIC_STATIONS_BY_ID[selectedStationId] && (
            <circle
              cx={SCHEMATIC_STATIONS_BY_ID[selectedStationId].sx}
              cy={SCHEMATIC_STATIONS_BY_ID[selectedStationId].sy}
              r={3.2}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={0.8}
            />
          )}

          {revealCorrect && correctStationId && SCHEMATIC_STATIONS_BY_ID[correctStationId] && (
            <g>
              <circle
                cx={SCHEMATIC_STATIONS_BY_ID[correctStationId].sx}
                cy={SCHEMATIC_STATIONS_BY_ID[correctStationId].sy}
                r={4}
                fill="#22c55e"
                stroke="white"
                strokeWidth={0.8}
              />
            </g>
          )}
        </g>
      </svg>

      <div className="absolute top-3 left-3">
        <button
          type="button"
          onClick={onToggleColoredLines}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow ${
            coloredLines
              ? "bg-orange-500/90 text-white hover:bg-orange-400"
              : "bg-slate-800/90 text-white hover:bg-slate-700"
          }`}
        >
          {coloredLines ? "Masquer les couleurs" : "Afficher les couleurs"}
        </button>
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => zoomBy(1.4)}
          className="w-9 h-9 rounded-full bg-slate-800/90 text-white text-lg font-bold shadow hover:bg-slate-700"
          aria-label="Zoomer"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.4)}
          className="w-9 h-9 rounded-full bg-slate-800/90 text-white text-lg font-bold shadow hover:bg-slate-700"
          aria-label="Dézoomer"
        >
          −
        </button>
      </div>
    </div>
  );
}
