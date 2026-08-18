import Link from "next/link";
import SchematicGame from "@/components/SchematicGameLoader";

export const metadata = {
  title: "Plan schématique — Métro Mania",
};

export default function SchematicPage() {
  return (
    <main className="flex-1 flex flex-col items-center gap-4 px-4 py-6 max-w-4xl mx-auto w-full">
      <div className="w-full flex items-center justify-between">
        <Link href="/" className="text-slate-400 hover:text-slate-200 text-sm">
          ← Accueil
        </Link>
        <span className="text-sm text-slate-500">Mode plan schématique</span>
      </div>
      <SchematicGame datasetKey="metro" />
    </main>
  );
}
