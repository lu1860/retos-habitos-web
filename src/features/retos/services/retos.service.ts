import type { Reto, RetoInput, Categoria, Participacion,ParticipacionConReto, } from "../domain/reto.ts";
import { validateReto, validateImage } from "../domain/validation.ts";
import { apiRequest } from "../../common/services/http.ts";
import type { DataResponse, PaginatedResponse } from "../../common/domain/pagination.ts";
export const retosService = {
 async participation(id: number): Promise<boolean> {
  const result = await apiRequest<{ data?: { participa?: unknown } }>("/retos/" + id + "/participacion");
  if (typeof result?.data?.participa !== "boolean") throw new Error("Respuesta de participación inválida.");
  return result.data.participa;
 },
async misParticipaciones(): Promise<ParticipacionConReto[]> {
  const result = await apiRequest<{ data: ParticipacionConReto[] }>(
    "/retos/mis-participaciones",);
  return result.data;
},
 list({ q = "", categoriaId, page = 1, limit = 6 }: { q?: string; categoriaId?: number; page?: number; limit?: number } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isSafeInteger(page) || page < 1) throw new Error("Paginación inválida: máximo 50 elementos.");
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q.trim()) query.set("q", q.trim());
  if (categoriaId) query.set("categoriaId", String(categoriaId));
  return apiRequest<PaginatedResponse<Reto>>("/retos?" + query);
 },
 async detail(id: number) { return (await apiRequest<DataResponse<Reto>>("/retos/" + id)).data; },
 async categories() { return (await apiRequest<DataResponse<Categoria[]>>("/categorias")).data; },
 async save(input: RetoInput, id?: number) {
  const issue = validateReto(input) || (input.imagen && validateImage(input.imagen));
  if (issue) throw new Error(issue);
  const fields = { nombre: input.nombre.trim(), descripcion: input.descripcion.trim(), duracionDias: input.duracionDias, categoriaId: input.categoriaId };
  let body: unknown = fields;
  if (input.imagen) {
   const form = new FormData();
   for (const [key, value] of Object.entries(fields)) form.append(key, String(value));
   form.append("imagen", input.imagen); body = form;
  }
  return (await apiRequest<DataResponse<Reto>>(id ? "/retos/" + id : "/retos", { method: id ? "PATCH" : "POST", body })).data;
 },
 remove(id: number) { return apiRequest<void>("/retos/" + id, { method: "DELETE" }); },
 async join(id: number) { return (await apiRequest<DataResponse<Participacion>>("/retos/" + id + "/participantes", { method: "POST" })).data; },
 leave(id: number) { return apiRequest<void>("/retos/" + id + "/participantes", { method: "DELETE" }); },
};
