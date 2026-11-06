"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { SchematicDataset } from "@/lib/schematicDataset";
import { lineColor } from "@/data/lineColors";

interface Props {
  dataset: SchematicDataset;
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
const NEUTRAL_LINE_COLOR = "#475569";
const INITIAL_SCALE = 1.6;

function initialTransform(viewBox: SchematicDataset["viewBox"]) {
  const cx = viewBox.x + viewBox.width / 2;
  const cy = viewBox.y + viewBox.height / 2;
  return { scale: INITIAL_SCALE, tx: cx - cx * INITIAL_SCALE, ty: cy - cy * INITIAL_SCALE };
}

export default function SchematicMap({
  dataset,
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
  // Visual sizes (dot radii, stroke widths) were tuned for the ~500-unit-wide
  // special/RER-B dataset; scale them to whatever width this dataset actually uses.
  const unit = dataset.viewBox.width / 500;
  const [transform, setTransform] = useState(() => initialTransform(dataset.viewBox));
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
    const d = drag.current;
    if (!d) return;
    const p = getSvgPoint(e.clientX, e.clientY);
    const dx = p.x - d.startX;
    const dy = p.y - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > unit * 5) {
      d.moved = true;
    }
    // Capture start values into locals (`d`) rather than reading `drag.current`
    // again here: this callback can run after pointerup/pointercancel has
    // already cleared the ref, and `drag.current!.startTx` would then throw.
    setTransform((t) => ({
      ...t,
      tx: d.startTx + dx,
      ty: d.startTy + dy,
    }));
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>, select: boolean) => {
    const d = drag.current;
    drag.current = null;
    if ((e.target as Element).hasPointerCapture?.(e.pointerId)) {
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
    if (!select || disabled || !d || d.moved) return;
    const p = getSvgPoint(e.clientX, e.clientY);
    const localX = (p.x - transform.tx) / transform.scale;
    const localY = (p.y - transform.ty) / transform.scale;
    const nearest = dataset.nearest(localX, localY);
    onSelectStation(nearest.id);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => endDrag(e, true);
  const handlePointerCancel = (e: React.PointerEvent<SVGSVGElement>) => endDrag(e, false);

  const zoomBy = useCallback(
    (factor: number, center?: { x: number; y: number }) => {
      setTransform((t) => {
        const cx = center?.x ?? dataset.viewBox.x + dataset.viewBox.width / 2;
        const cy = center?.y ?? dataset.viewBox.y + dataset.viewBox.height / 2;
        const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * factor));
        const contentX = (cx - t.tx) / t.scale;
        const contentY = (cy - t.ty) / t.scale;
        return {
          scale: newScale,
          tx: cx - contentX * newScale,
          ty: cy - contentY * newScale,
        };
      });
    },
    [dataset.viewBox]
  );

  // Native (non-passive) listener: React's onWheel is passive, so preventDefault()
  // there throws instead of stopping the page from scrolling while we zoom.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      // Trackpad pinch-to-zoom is synthesized as wheel+ctrlKey by the browser;
      // a plain two-finger swipe (ctrlKey false) should pan, not zoom.
      if (e.ctrlKey) {
        const p = getSvgPoint(e.clientX, e.clientY);
        zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2, p);
      } else {
        setTransform((t) => ({ ...t, tx: t.tx - e.deltaX, ty: t.ty - e.deltaY }));
      }
    };
    svg.addEventListener("wheel", handler, { passive: false });
    return () => svg.removeEventListener("wheel", handler);
  }, [getSvgPoint, zoomBy]);

  return (
    <div className="relative w-full h-full touch-none select-none">
      <svg
        ref={svgRef}
        viewBox={`${dataset.viewBox.x} ${dataset.viewBox.y} ${dataset.viewBox.width} ${dataset.viewBox.height}`}
        className="w-full h-full bg-slate-950 rounded-xl cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <g transform={`translate(${transform.tx} ${transform.ty}) scale(${transform.scale})`}>
          {dataset.linePaths.map((seg, i) => (
            <path
              key={i}
              d={seg.d}
              transform={`matrix(${seg.matrix.join(" ")})`}
              fill="none"
              stroke={coloredLines ? lineColor(seg.line) : NEUTRAL_LINE_COLOR}
              strokeWidth={unit * 1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          ))}

          {dataset.edges.map((edge, i) => {
            const a = dataset.pointsById[edge.a];
            const b = dataset.pointsById[edge.b];
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.sx}
                y1={a.sy}
                x2={b.sx}
                y2={b.sy}
                stroke={coloredLines ? lineColor(edge.line) : NEUTRAL_LINE_COLOR}
                strokeWidth={unit * 1.4}
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })}

          {dataset.points.map((s) => (
            <circle
              key={s.id}
              cx={s.sx}
              cy={s.sy}
              r={unit * 1.6}
              fill="#0f172a"
              stroke="#e2e8f0"
              strokeWidth={unit * 0.6}
            />
          ))}

          {wrongGuessIds.map((id) => {
            const s = dataset.pointsById[id];
            if (!s) return null;
            const r = unit * 2.2;
            return (
              <g key={id}>
                <circle cx={s.sx} cy={s.sy} r={unit * 3.2} fill="none" stroke="#ef4444" strokeWidth={unit} />
                <line x1={s.sx - r} y1={s.sy - r} x2={s.sx + r} y2={s.sy + r} stroke="#ef4444" strokeWidth={unit} />
                <line x1={s.sx - r} y1={s.sy + r} x2={s.sx + r} y2={s.sy - r} stroke="#ef4444" strokeWidth={unit} />
              </g>
            );
          })}

          {selectedStationId && dataset.pointsById[selectedStationId] && (
            <circle
              cx={dataset.pointsById[selectedStationId].sx}
              cy={dataset.pointsById[selectedStationId].sy}
              r={unit * 3.2}
              fill="#3b82f6"
              stroke="white"
              strokeWidth={unit * 0.8}
            />
          )}

          {revealCorrect && correctStationId && dataset.pointsById[correctStationId] && (
            <g>
              <circle
                cx={dataset.pointsById[correctStationId].sx}
                cy={dataset.pointsById[correctStationId].sy}
                r={unit * 4}
                fill="#22c55e"
                stroke="white"
                strokeWidth={unit * 0.8}
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
