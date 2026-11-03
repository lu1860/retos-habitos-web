import type { PaginatedResponse } from "../../common/domain/pagination";
import { apiRequest } from "../../common/services/http";
import type { Usuario, UsuariosQuery } from "../domain/usuario";

export const USUARIOS_PAGE_SIZE = 10;

/** GET /api/usuarios (solo admin). Ejemplo de listado paginado con filtros. */
export const usuariosService = {
  list(query: UsuariosQuery): Promise<PaginatedResponse<Usuario>> {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(USUARIOS_PAGE_SIZE),
    });
    if (query.q.trim()) params.set("q", query.q.trim());
    if (query.rol) params.set("rol", query.rol);
    return apiRequest<PaginatedResponse<Usuario>>(`/usuarios?${params.toString()}`, {
      errorMessage: "No se pudo cargar la lista de usuarios.",
    });
  },
};
