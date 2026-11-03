"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Loading } from "../../common/components/Loading";
import { safeNextPath } from "../domain/routes";
import { useSession } from "../hooks/useSession";

/**
 * Guarda de /login y /register: con sesión activa lleva al inicio (o a la ruta de ?next=).
 * También hace la redirección justo después de iniciar sesión o registrarse.
 * Usa useSearchParams: debe ir dentro de un <Suspense>.
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const next = useSearchParams().get("next");

  useEffect(() => {
    if (status === "authenticated") router.replace(safeNextPath(next));
  }, [status, next, router]);

  if (status === "authenticated") return <Loading message="Entrando…" />;
  return <>{children}</>;
}
