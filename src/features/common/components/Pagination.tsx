import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination as PaginationData } from "../domain/pagination";

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

/** Controles de anterior / siguiente para cualquier lista paginada de la API. */
export function Pagination({ pagination, onPageChange, disabled = false }: PaginationProps) {
  const { currentPage, totalPages, total } = pagination;
  if (totalPages <= 1) return null;

  const buttonClass =
    "inline-flex min-h-11 items-center gap-1 rounded-lg border border-line bg-surface px-3 text-sm font-bold text-ink hover:border-water disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Página {currentPage} de {totalPages} ({total} en total)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className={buttonClass}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Anterior
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage >= totalPages}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
