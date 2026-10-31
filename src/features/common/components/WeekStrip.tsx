import { Check } from "lucide-react";

const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

interface WeekStripProps {
  /** Cuántos días de la semana aparecen cumplidos. */
  done: number;
  /** "dark" para fondos oscuros (panel de marca), "light" para fondos claros. */
  tone?: "dark" | "light";
}

/**
 * Una semana con los días cumplidos marcados: el símbolo visual del proyecto
 * (cada día que registras tu reto es un día marcado).
 */
export function WeekStrip({ done, tone = "dark" }: WeekStripProps) {
  const pending = tone === "dark" ? "border-white/30 text-white/70" : "border-line text-muted";
  return (
    <ol
      className="flex gap-1.5 sm:gap-2"
      aria-label={`Ejemplo: ${done} de ${DAYS.length} días cumplidos`}
    >
      {DAYS.map((day, index) => {
        const isDone = index < done;
        return (
          <li
            key={index}
            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 font-display text-sm font-bold sm:h-11 sm:w-11 ${
              isDone ? "border-sun bg-sun text-ink" : pending
            }`}
          >
            {isDone ? <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" /> : day}
          </li>
        );
      })}
    </ol>
  );
}
