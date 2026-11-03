import type { User, UserRole } from "../../auth/domain/auth";

/** En la vista de administración un usuario tiene la misma forma que el de la sesión. */
export type Usuario = User;

export interface UsuariosQuery {
  page: number;
  /** Texto a buscar en nombre o email. */
  q: string;
  rol?: UserRole;
}
