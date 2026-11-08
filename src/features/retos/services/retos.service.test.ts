import assert from "node:assert/strict";
import { test, afterEach, mock } from "node:test";
import { retosService } from "./retos.service.ts";
import { ApiError } from "../../common/services/api-error.ts";
import { sessionStore } from "../../auth/services/session.store.ts";
const reto = { id: 90, nombre: "TEST-B-FRONT-contrato", descripcion: "Temporal", categoriaId: 2, duracionDias: 7, imagenUrl: null, esOficial: false, creadorId: 5, status: "ACTIVE", createdAt: "2026-11-08T00:00:00Z", updatedAt: "2026-11-08T00:00:00Z" };
const input = { nombre: reto.nombre, descripcion: reto.descripcion, categoriaId: 2, duracionDias: 7 };
afterEach(() => mock.restoreAll());
function response(body: unknown, status = 200) { return new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }); }
function http(body: unknown, status = 200) { return mock.method(globalThis, "fetch", async () => response(body, status)); }
test("listado conserva contrato, filtros codificados y paginación remota", async () => {
 const payload = { data: [reto], pagination: { total: 51, currentPage: 2, limit: 50, totalPages: 2 } };
 const fetch = http(payload);
 assert.deepEqual(await retosService.list({ q: " leer & andar ", categoriaId: 2, page: 2, limit: 50 }), payload);
 const url = new URL(String(fetch.mock.calls[0].arguments[0]));
 assert.equal(url.pathname, "/api/retos");
 assert.equal(url.searchParams.get("q"), "leer & andar");
 assert.equal(url.searchParams.get("categoriaId"), "2");
 assert.equal(url.searchParams.get("page"), "2"); assert.equal(url.searchParams.get("limit"), "50");
 for (const limit of [0, 51, 1.5]) assert.throws(() => retosService.list({ limit }));
 assert.throws(() => retosService.list({ page: 0 }));
 assert.equal(fetch.mock.callCount(), 1);
});
test("categorías activas usa únicamente GET /categorias y su proyección pública", async () => {
 const fetch = http({ data: [{ id: 2, nombre: "Lectura" }] });
 assert.deepEqual(await retosService.categories(), [{ id: 2, nombre: "Lectura" }]);
 assert.ok(String(fetch.mock.calls[0].arguments[0]).endsWith("/api/categorias"));
});
test("detalle usa endpoint propio, sin inventar creadores o participantes", async () => {
 const fetch = http({ data: reto });
 const result = await retosService.detail(90);
 assert.deepEqual(result, reto);
 assert.ok(String(fetch.mock.calls[0].arguments[0]).endsWith("/api/retos/90"));
 for (const field of ["participantes", "totalParticipantes", "creadorNombre", "participa"]) assert.equal(field in result, false);
});
test("lista vacía no recurre a fixtures", async () => {
 http({ data: [], pagination: { total: 0, currentPage: 1, totalPages: 0, limit: 6 } });
 assert.deepEqual((await retosService.list()).data, []);
});
test("creación y edición JSON envían campos permitidos y JWT de la sesión", async () => {
 mock.method(sessionStore, "getToken", () => "jwt-prueba");
 const fetch = http({ data: reto }, 201);
 assert.deepEqual(await retosService.save(input), reto);
 await retosService.save({ ...input, ...reto }, 90);
 for (const [index, method] of ["POST", "PATCH"].entries()) {
  const [url, options] = fetch.mock.calls[index].arguments as unknown as [string, RequestInit];
  assert.ok(url.endsWith(index ? "/retos/90" : "/retos")); assert.equal(options.method, method);
  assert.deepEqual(JSON.parse(String(options.body)), input);
  assert.equal((options.headers as Record<string,string>).Authorization, "Bearer jwt-prueba");
 }
});
test("multipart imagen JPEG, PNG y WebP sin Content-Type manual ni imagenUrl", async () => {
 const fetch = http({ data: reto });
 for (const type of ["image/jpeg", "image/png", "image/webp"]) {
  const imagen = new File(["contenido simulado"], "imagen", { type });
  await retosService.save({ ...input, imagen }, 90);
  const options = fetch.mock.calls.at(-1)!.arguments[1] as RequestInit;
  assert.ok(options.body instanceof FormData);
  assert.deepEqual([...options.body.keys()].sort(), ["categoriaId", "descripcion", "duracionDias", "imagen", "nombre"]);
  assert.equal(options.body.get("duracionDias"), "7");
  assert.equal((options.body.get("imagen") as File).type, type);
  assert.equal((options.headers as Record<string,string>)["Content-Type"], undefined);
 }
});
test("imágenes inválidas y datos inválidos no producen HTTP", async () => {
 const fetch = http({ data: reto });
 for (const imagen of [new File(["x"], "x.gif", { type: "image/gif" }), new File([], "x.png", { type: "image/png" }), new File([new Uint8Array(2097153)], "x.png", { type: "image/png" })]) await assert.rejects(retosService.save({ ...input, imagen }));
 await assert.rejects(retosService.save({ ...input, nombre: "" }));
 assert.equal(fetch.mock.callCount(), 0);
});
test("eliminación maneja 204 sin leer JSON", async () => {
 const fetch = http(null, 204);
 assert.equal(await retosService.remove(90), undefined);
 assert.equal((fetch.mock.calls[0].arguments[1] as RequestInit).method, "DELETE");
});
test("unión 201/200 y abandono 204 no envían usuario ni cuerpo", async () => {
 const participacion = { id: 1, usuarioId: 5, retoId: 90, fechaUnion: reto.createdAt, status: "ACTIVE" };
 for (const status of [201, 200]) {
  const fetch = http({ data: participacion }, status);
  assert.deepEqual(await retosService.join(90), participacion);
  assert.ok(String(fetch.mock.calls[0].arguments[0]).endsWith("/retos/90/participantes"));
  assert.equal((fetch.mock.calls[0].arguments[1] as RequestInit).body, undefined);
 }
 const fetch = http(null, 204); assert.equal(await retosService.leave(90), undefined);
 assert.equal((fetch.mock.calls[0].arguments[1] as RequestInit).method, "DELETE");
 assert.equal((fetch.mock.calls[0].arguments[1] as RequestInit).body, undefined);
});
for (const status of [400, 401, 403, 404, 409]) test("errores reales " + status + " preservan mensaje y detalles", async () => {
 http({ error: "Rechazo confirmado", details: { nombre: "Detalle del backend" } }, status);
 for (const operation of [() => retosService.list(), () => retosService.detail(90), () => retosService.categories(), () => retosService.save(input), () => retosService.save(input,90), () => retosService.remove(90), () => retosService.join(90), () => retosService.leave(90)]) {
  await assert.rejects(operation(), (error: unknown) => error instanceof ApiError && error.status === status && error.message === "Rechazo confirmado" && error.details.nombre === "Detalle del backend");
 }
});
test("401 con JWT cierra sesión usando el mecanismo existente", async () => {
 mock.method(sessionStore, "getToken", () => "vencido"); const clear = mock.method(sessionStore, "clear", () => {});
 http({ error: "Token inválido" }, 401); await assert.rejects(retosService.join(90));
 assert.deepEqual(clear.mock.calls[0].arguments, [true]);
});
test("error de red permite reintentar sin datos ficticios", async () => {
 const fetch = mock.method(globalThis, "fetch", async () => { throw new Error("offline"); });
 await assert.rejects(retosService.list(), (e: unknown) => e instanceof ApiError && e.status === 0);
 fetch.mock.mockImplementation(async () => response({ data: reto }));
 assert.deepEqual(await retosService.detail(90), reto);
});
