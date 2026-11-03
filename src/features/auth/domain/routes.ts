/** Página a la que se llega después de iniciar sesión o registrarse. */
export const HOME_PATH = "/retos";

/** Página a la que se envía a quien entra a una ruta de admin sin serlo. */
export const FORBIDDEN_REDIRECT_PATH = "/retos";

/**
 * Valida el parámetro ?next= del login. Solo acepta rutas internas ("/retos/3"),
 * para que nadie pueda armar un enlace que lleve a otra página después del login.
 */
export const safeNextPath = (next: string | null): string => {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return HOME_PATH;
  }
  if (next.startsWith("/login") || next.startsWith("/register")) return HOME_PATH;
  return next;
};
