import Link from "next/link";
import { WeekStrip } from "@/src/features/common/components/WeekStrip";

/**
 * Landing. Versión inicial con lo esencial; C la completa con la descripción
 * del proyecto, cómo funciona y los retos oficiales.
 */
export default function HomePage() {
  return (
    <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-6">
        <h1 className="font-display text-4xl leading-tight font-bold sm:text-5xl">
          Pequeños hábitos, en grupo y un día a la vez.
        </h1>
        <p className="max-w-prose text-lg text-ink-soft">
          Tomar agua, caminar, leer 15 minutos. Únete a un reto corto con otras personas, marca cada
          día que lo cumples y mira cuántos llevas.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center rounded-lg bg-water px-5 font-bold text-white hover:bg-water-dark"
          >
            Crear cuenta
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-lg border border-line bg-surface px-5 font-bold hover:border-water"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4 min-w-0 rounded-2xl bg-ink p-6 text-white sm:p-8">
        <p className="font-display text-xl font-bold">8 vasos de agua al día</p>
        <WeekStrip done={5} />
        <p className="text-white/75">Llevas 5 días de 21.</p>
      </div>
    </section>
  );
}
