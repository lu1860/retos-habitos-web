
import { apiRequest } from "../../common/services/http";

export interface Registro {
  id: number;
  usuarioId: number;
  retoId: number;
  fecha: string;
  nota?: string | null;
  status: string;
}

export interface Progreso {
  totalDias: number;
  // Añadiremos los demás campos según la respuesta real de la API.
}

export const registrosService = {
  async create(retoId: number, nota?: string) {
    return apiRequest<{ data: Registro }>(
      `/retos/${retoId}/registros`,
      {
        method: "POST",
        body: nota?.trim() ? { nota: nota.trim() } : {},
      },
    );
  },

  async list(retoId: number) {
    return apiRequest<{ data: Registro[] }>(
      `/retos/${retoId}/registros`,
    );
  },

  async progress(retoId: number) {
    return apiRequest<{ data: Progreso }>(
      `/retos/${retoId}/progreso`,
    );
  },

  async update(id: number, nota: string) {
    return apiRequest<{ data: Registro }>(
      `/registros/${id}`,
      {
        method: "PUT",
        body: { nota },
      },
    );
  },

  async remove(id: number) {
    return apiRequest<void>(
      `/registros/${id}`,
      { method: "DELETE" },
    );
  },
};
