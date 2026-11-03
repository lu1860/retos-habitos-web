"use client";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Loading } from "../../common/components/Loading";
import { FORBIDDEN_REDIRECT_PATH } from "../domain/routes";
import { useSession } from "../hooks/useSession";

/**
 * Guarda de rol: solo admin. Va DENTRO de PrivateRoute (ya hay sesión).
 * Un user que escribe /admin a mano es redirigido; la API además le responde 403.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { status, isAdmin } = useSession();
  const router = useRouter();
  const denied = status === "authenticated" && !isAdmin;

  useEffect(() => {
    if (denied) router.replace(`${FORBIDDEN_REDIRECT_PATH}?sinPermiso=1`);
  }, [denied, router]);

  if (!isAdmin) return <Loading message="Verificando permisos…" />;
  return <>{children}</>;
}
