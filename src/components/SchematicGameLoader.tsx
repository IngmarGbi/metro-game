"use client";

import dynamic from "next/dynamic";

const SchematicGame = dynamic(() => import("@/components/SchematicGame"), {
  ssr: false,
  loading: () => <p className="text-slate-500 text-sm">Chargement de la partie…</p>,
});

export default SchematicGame;
