import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Métro <span className="text-orange-400">Mania</span>
        </h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Teste ta connaissance du métro parisien en 2 modes de jeu.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 w-full max-w-3xl">
        <Link
          href="/geo"
          className="group flex flex-col gap-3 p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-400 transition-colors text-left"
        >
          <span className="text-3xl">🗺️</span>
          <h2 className="text-xl font-bold">Carte réelle</h2>
          <p className="text-slate-400 text-sm">
            Place la station à son emplacement réel sur la carte de Paris. Plus tu es précis, plus tu marques de points.
          </p>
          <span className="mt-auto text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">
            Jouer →
          </span>
        </Link>

        <Link
          href="/schematic"
          className="group flex flex-col gap-3 p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-orange-400 transition-colors text-left"
        >
          <span className="text-3xl">🚇</span>
          <h2 className="text-xl font-bold">Plan schématique</h2>
          <p className="text-slate-400 text-sm">
            Retrouve la station sur le plan du métro. Tu as 3 tentatives par manche.
          </p>
          <span className="mt-auto text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">
            Jouer →
          </span>
        </Link>
      </div>

      <p className="text-xs text-slate-600 max-w-md">
        Données des stations : Île-de-France Mobilités (licence ouverte).
      </p>
    </main>
  );
}
