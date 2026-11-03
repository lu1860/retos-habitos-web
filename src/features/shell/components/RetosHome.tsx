"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSession } from "../../auth/hooks/useSession";
import { Alert } from "../../common/components/Alert";

function ForbiddenNotice() {
  const denied = useSearchParams().get("sinPermiso") === "1";
  return denied ? <Alert type="info" message="Esa sección es solo para administración." /> : null;
}

/**
 * Página de inicio con sesión. Es temporal: B la reemplaza por el listado de retos
 * (features/retos). El aviso de "sin permiso" lo muestra cuando AdminRoute redirige aquí.
 */
export function RetosHome() {
  const { user } = useSession();
  return (
    <section className="flex flex-col gap-4">
      <Suspense fallback={null}>
        <ForbiddenNotice />
      </Suspense>
      <h1 className="font-display text-3xl font-bold">Hola, {user?.nombre}</h1>
      <p className="max-w-prose text-muted">
        Aquí vas a ver los retos disponibles, unirte a ellos y registrar cada día que cumples.
      </p>
    </section>
  );
}
