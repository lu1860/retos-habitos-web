"use client";
import { createContext, useContext } from "react";
import type { LoginCredentials, RegisterPayload, SessionStatus, User } from "../domain/auth";

export interface SessionContextValue {
  status: SessionStatus;
  /** Usuario con sesión, o null. */
  user: User | null;
  isAdmin: boolean;
  /** Inicia sesión. Si falla, lanza un ApiError con el mensaje del backend. */
  login: (credentials: LoginCredentials) => Promise<void>;
  /** Crea la cuenta y deja la sesión iniciada. */
  register: (payload: RegisterPayload) => Promise<void>;
  /** Borra el token y lleva al login. */
  logout: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

/** Sesión actual desde cualquier componente de cliente. */
export function useSession(): SessionContextValue {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return session;
}
