"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Loading } from "../../common/components/Loading";
import { useSession } from "../hooks/useSession";
import { sessionStore } from "../services/session.store";

/**
 * Guarda de ruta privada: sin sesión lleva a /login?next=<ruta actual>
 * (con &expirada=1 si la sesión terminó porque el token venció).
 * Protege también cuando la URL se escribe a mano, no solo cuando se oculta un enlace.
 * La protección real de los datos la hace la API (401/403); esto es la experiencia de usuario.
 */
export function PrivateRoute({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "anonymous") {
      const params = new URLSearchParams({ next: pathname });
      if (sessionStore.consumeExpiration()) params.set("expirada", "1");
      router.replace(`/login?${params.toString()}`);
    }
  }, [status, pathname, router]);

  if (status !== "authenticated") {
    return <Loading message="Verificando tu sesión…" fullScreen />;
  }
  return <>{children}</>;
}
