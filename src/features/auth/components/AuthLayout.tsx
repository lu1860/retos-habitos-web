import type { ReactNode } from "react";
import { BrandLink } from "../../common/components/BrandLink";
import { WeekStrip } from "../../common/components/WeekStrip";

/**
 * Estructura de /login y /register: panel de marca a la izquierda (solo en pantallas
 * medianas y grandes) y el formulario a la derecha.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-ink p-10 text-white md:flex lg:p-14">
        <BrandLink tone="dark" />
        <div className="flex max-w-md flex-col gap-8">
          <p className="font-display text-4xl leading-tight font-bold lg:text-5xl">
            Un hábito se construye marcando un día a la vez.
          </p>
          <WeekStrip done={5} />
          <p className="text-white/75">
            Únete a retos cortos con otras personas, registra cada día que cumples y mira cuántos
            llevas.
          </p>
        </div>
        <p className="text-sm text-white/60">Proyecto de Aula de Desarrollo Web, 2026-2</p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="md:hidden">
          <BrandLink />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
