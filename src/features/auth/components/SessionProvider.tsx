"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { LoginCredentials, RegisterPayload, StoredSession } from "../domain/auth";
import { SessionContext, type SessionContextValue } from "../hooks/useSession";
import { authService } from "../services/auth.service";
import { sessionStore } from "../services/session.store";

// setTimeout no acepta esperas mayores a ~24,8 días
const MAX_TIMEOUT_MS = 2_147_483_647;

// En el servidor no existe localStorage: "undefined" significa "todavía no se sabe" (loading)
const getServerSnapshot = (): StoredSession | null | undefined => undefined;

/**
 * Guarda la sesión de toda la aplicación y la comparte con useSession().
 *
 *  - Lee la sesión guardada en el navegador: sobrevive al refrescar.
 *  - Al cargar, confirma con GET /auth/me que el token sigue sirviendo.
 *  - Cierra la sesión sola cuando el token vence.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    getServerSnapshot,
  );
  const accessToken = session?.token.accessToken;
  const expiresAt = session?.expiresAt;

  // Confirma el token guardado una vez por token. Si ya no sirve, el cliente HTTP
  // recibe 401, borra la sesión y lleva al login; otros errores (sin red) no cierran la sesión.
  useEffect(() => {
    if (!accessToken) return;
    authService
      .me()
      .then((user) => sessionStore.updateUser(user))
      .catch(() => undefined);
  }, [accessToken]);

  // Cierra la sesión justo cuando el token vence, aunque la persona no haga nada.
  // Si está en una página privada, PrivateRoute la lleva al login con el aviso.
  useEffect(() => {
    if (!expiresAt) return;
    const remaining = expiresAt - Date.now();
    if (remaining > MAX_TIMEOUT_MS) return;
    const timer = window.setTimeout(() => sessionStore.clear(true), Math.max(remaining, 0));
    return () => window.clearTimeout(timer);
  }, [expiresAt]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { user, token } = await authService.login(credentials);
    sessionStore.save(user, token);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user, token } = await authService.register(payload);
    sessionStore.save(user, token);
  }, []);

  const logout = useCallback(() => {
    sessionStore.clear();
    router.replace("/login");
  }, [router]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status: session === undefined ? "loading" : session ? "authenticated" : "anonymous",
      user: session?.user ?? null,
      isAdmin: session?.user.rol === "admin",
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
