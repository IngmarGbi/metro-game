"use client";

import dynamic from "next/dynamic";

const GeoGame = dynamic(() => import("@/components/GeoGame"), {
  ssr: false,
  loading: () => <p className="text-slate-500 text-sm">Chargement de la partie…</p>,
});

export default GeoGame;
