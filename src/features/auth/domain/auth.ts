export type UserRole = "admin" | "user";

/** Usuario tal como lo devuelve la API (nunca trae la contraseña). */
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface AuthToken {
  accessToken: string;
  tokenType: "Bearer";
  /** Segundos de validez del token. */
  expiresIn: number;
}

/** Respuesta de login y registro: { data: { user, token } }. */
export interface AuthResult {
  user: User;
  token: AuthToken;
}

/** Lo que se guarda en el navegador: el usuario, el token y cuándo vence (milisegundos). */
export interface StoredSession {
  user: User;
  token: AuthToken;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
}

/**
 * Estado de la sesión:
 *  - loading: todavía no se ha leído el navegador (primer render).
 *  - authenticated / anonymous: ya se sabe si hay sesión.
 */
export type SessionStatus = "loading" | "authenticated" | "anonymous";
