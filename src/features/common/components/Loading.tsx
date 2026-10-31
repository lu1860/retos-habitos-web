import { LoaderCircle } from "lucide-react";

interface LoadingProps {
  message?: string;
  /** true para ocupar todo el alto disponible (por ejemplo, mientras se verifica la sesión). */
  fullScreen?: boolean;
}

/** Indicador de carga. No usa hooks: sirve en componentes de cliente y de servidor. */
export function Loading({ message = "Cargando…", fullScreen = false }: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-16 text-muted ${fullScreen ? "min-h-dvh" : ""}`}
    >
      <LoaderCircle className="h-7 w-7 animate-spin text-water" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
