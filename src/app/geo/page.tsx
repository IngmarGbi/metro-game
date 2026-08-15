import Link from "next/link";
import GeoGame from "@/components/GeoGameLoader";

export const metadata = {
  title: "Carte réelle — Métro Mania",
};

export default function GeoPage() {
  return (
    <main className="flex-1 flex flex-col items-center gap-4 px-4 py-6 max-w-4xl mx-auto w-full">
      <div className="w-full flex items-center justify-between">
        <Link href="/" className="text-slate-400 hover:text-slate-200 text-sm">
          ← Accueil
        </Link>
        <span className="text-sm text-slate-500">Mode carte réelle</span>
      </div>
      <GeoGame />
    </main>
  );
}
