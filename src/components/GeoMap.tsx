"use client";

import dynamic from "next/dynamic";

const LeafletMapInner = dynamic(() => import("@/components/LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-slate-800 animate-pulse flex items-center justify-center text-slate-400">
      Chargement de la carte…
    </div>
  ),
});

export default LeafletMapInner;
