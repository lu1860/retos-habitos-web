import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { act, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";

// Compila TSX solo en pruebas usando TypeScript, ya instalado en el proyecto.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/image") {
      const resolved = nextResolve("next/image.js", context);
      return { shortCircuit: true, url: "data:text/javascript," + encodeURIComponent(`import Image from ${JSON.stringify(resolved.url)}; export default Image.default ?? Image;`) };
    }
    if (specifier.startsWith(".") && context.parentURL) {
      for (const extension of [".ts", ".tsx"]) {
        const candidate = new URL(specifier + extension, context.parentURL);
        if (existsSync(candidate)) return nextResolve(candidate.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith("file:") && /\.tsx$/.test(url)) {
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext } }).outputText };
    }
    return nextLoad(url, context);
  },
});
const { ParticipationControls } = await import("./ParticipationControls.tsx");
const { RetoCard } = await import("./RetoCard.tsx");
const { RetoForm } = await import("./RetoForm.tsx");
const { useRetos } = await import("../hooks/useRetos.ts");
const { retosService } = await import("../services/retos.service.ts");
const noop = () => {};
test("participación inicialmente desconocida permite ambas acciones sin afirmar pertenencia", () => {
  const html = renderToStaticMarkup(createElement(ParticipationControls, { state: "unknown", busy: false, onJoin: noop, onLeave: noop }));
  assert.match(html, /Participación desconocida/);
  assert.match(html, /Confirmar unión/); assert.match(html, /Abandonar reto/);
  assert.doesNotMatch(html, /Ya participas|Participación confirmada|participantes/);
});
test("participación confirmada y abandono confirmado ofrecen la acción correspondiente", () => {
  for (const state of ["joined", "left"] as const) {
    const html = renderToStaticMarkup(createElement(ParticipationControls, { state, busy: false, onJoin: noop, onLeave: noop }));
    assert.match(html, state === "joined" ? /Participación confirmada/ : /Abandono confirmado/);
    assert.equal(html.includes("Confirmar unión"), state === "left");
    assert.equal(html.includes("Abandonar reto"), state === "joined");
  }
});
test("ambas acciones de participación quedan bloqueadas durante la solicitud", () => {
  const html = renderToStaticMarkup(createElement(ParticipationControls, { state: "unknown", busy: true, onJoin: noop, onLeave: noop }));
  assert.equal((html.match(/disabled=""/g) ?? []).length, 2);
});
const reto = { id: 90, nombre: "Leer", descripcion: "Un capítulo", categoriaId: 3, duracionDias: 7, imagenUrl: null, esOficial: true, creadorId: 5, status: "ACTIVE" as const, createdAt: "2026-11-08T00:00:00Z", updatedAt: "2026-11-08T00:00:00Z" };
test("tarjeta presenta categoría real y oficialidad, sin creador ni contador inventado", () => {
  const html = renderToStaticMarkup(createElement(RetoCard, { reto, categoryName: "Lectura", onDetail: noop }));
  assert.match(html, /Lectura/); assert.match(html, /Reto oficial/); assert.match(html, /Leer/);
  assert.doesNotMatch(html, /participantes|Ya participas|Creado por|demo-/);
});
test("formulario usa categorías de API, límites reales y no ofrece eliminar imagen existente", () => {
  const html = renderToStaticMarkup(createElement(RetoForm, { reto: { ...reto, imagenUrl: "https://example.org/image.jpg" }, categories: [{ id: 3, nombre: "Lectura real" }], busy: false, onSave: async () => {}, onCancel: noop }));
  assert.match(html, /value="3"[^>]*>Lectura real/);
  assert.match(html, /maxLength="120"/); assert.match(html, /maxLength="1000"/);
  assert.match(html, /image\/jpeg,image\/png,image\/webp/);
  assert.doesNotMatch(html, /Quitar imagen|Eliminar imagen|demostración|Movimiento|Bienestar/);
});

// DOM local: ejecuta componentes, hooks y eventos reales de React sin API ni escrituras.
async function withDOM(run: (container: HTMLElement, dom: JSDOM) => Promise<void>) {
  const dom = new JSDOM("<!doctype html><div id='root'></div>", { url: "http://localhost" });
  const globals = { window: dom.window, document: dom.window.document, FileReader: dom.window.FileReader, IS_REACT_ACT_ENVIRONMENT: true };
  const originals = new Map<string, PropertyDescriptor | undefined>();
  for (const [key, value] of Object.entries(globals)) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  try { await run(dom.window.document.getElementById("root")!, dom); }
  finally {
    mock.restoreAll();
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
}

test("descartar permite reelegir el mismo archivo, reemplazarlo y reabrir el formulario limpio", async () => {
  await withDOM(async (container, dom) => {
    let root = createRoot(container);
    const saved: unknown[] = [];
    const props = { reto: { ...reto, imagenUrl: "https://example.org/original.png" }, categories: [{ id: 3, nombre: "Lectura" }], busy: false, onSave: async (input: unknown) => { saved.push(input); }, onCancel: noop };
    const mount = () => act(async () => { root.render(createElement(RetoForm, props)); });
    const button = (text: string) => [...container.querySelectorAll("button")].find(b => b.textContent === text)!;
    const fileInput = () => container.querySelector<HTMLInputElement>("input[type=file]")!;
    const first = new dom.window.File(["primera"], "primera.png", { type: "image/png" });
    const second = new dom.window.File(["segunda"], "segunda.png", { type: "image/png" });
    const select = async (file: File) => {
      const input = fileInput();
      // El navegador solo genera change al cambiar la selección nativa.
      if (input.value === file.name) return;
      Object.defineProperty(input, "value", { configurable: true, writable: true, value: file.name });
      Object.defineProperty(input, "files", { configurable: true, value: [file] });
      await act(async () => {
        const read = new Promise<void>(resolve => {
          const RealReader = dom.window.FileReader;
          mock.method(globalThis, "FileReader", class extends RealReader {
            constructor() { super(); this.addEventListener("loadend", () => resolve()); }
          });
        });
        input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
        await read;
      });
    };
    const submit = () => act(async () => { container.querySelector("form")!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); });
    await mount();
    try {
      await select(first as unknown as File);
      await act(async () => { button("Descartar selección").click(); });
      assert.equal(fileInput().value, "");
      assert.equal(container.querySelector("img")?.getAttribute("src"), props.reto.imagenUrl);
      await select(first as unknown as File);
      await submit();
      assert.equal((saved.at(-1) as { imagen: unknown }).imagen, first);
      await select(second as unknown as File);
      await submit();
      assert.equal((saved.at(-1) as { imagen: unknown }).imagen, second);
      await act(async () => { root.unmount(); });
      root = createRoot(container);
      await mount();
      assert.equal(fileInput().value, "");
      assert.equal(container.querySelector("img")?.getAttribute("src"), props.reto.imagenUrl);
      assert.equal(button("Descartar selección"), undefined);
      await select(first as unknown as File);
      await submit();
      assert.equal((saved.at(-1) as { imagen: unknown }).imagen, first);
    } finally { await act(async () => { root.unmount(); }); }
  });
});

test("fallo de categorías conserva retos y paginación, limpia categorías previas y permite reintentar", async () => {
  await withDOM(async container => {
    const root = createRoot(container);
    const payload = { data: [reto], pagination: { total: 1, currentPage: 1, limit: 6, totalPages: 1 } };
    const list = mock.method(retosService, "list", async () => payload);
    const categories = mock.method(retosService, "categories", async () => [{ id: 3, nombre: "Lectura" }]);
    let state: ReturnType<typeof useRetos>;
    function Harness() { state = useRetos("", undefined, 1, 6); return null; }
    await act(async () => { root.render(createElement(Harness)); });
    try {
      await act(async () => { await state.reload(); });
      assert.deepEqual(state!.categories, [{ id: 3, nombre: "Lectura" }]);
      categories.mock.mockImplementation(async () => { throw new Error("Categorías fuera de servicio"); });
      await act(async () => { await state.reload(); });
      assert.deepEqual(state!.items, [reto]);
      assert.deepEqual(state!.pagination, payload.pagination);
      assert.equal(state!.error, null);
      assert.equal(state!.loading, false);
      assert.deepEqual(state!.categories, []);
      assert.match(state!.categoriesError!, /categorías no están disponibles temporalmente/);
      const html = renderToStaticMarkup(createElement(RetoForm, { reto, categories: state!.categories, busy: false, onSave: async () => {}, onCancel: noop }));
      assert.match(html, /disabled=""[^>]*>Guardar reto/);
      categories.mock.mockImplementation(async () => [{ id: 3, nombre: "Lectura" }]);
      await act(async () => { await state.reload(); });
      assert.equal(state!.categoriesError, null);
      assert.equal(state!.categories.length, 1);
      list.mock.mockImplementation(async () => { throw new Error("Retos fuera de servicio"); });
      await act(async () => { await state.reload(); });
      assert.equal(state!.error, "Retos fuera de servicio");
      assert.equal(state!.categories.length, 1);
    } finally { await act(async () => { root.unmount(); }); }
  });
});

test("formulario rechaza guardar un ID de categoría desconocido aunque se fuerce submit", async () => {
  await withDOM(async (container, dom) => {
    const root = createRoot(container);
    let saves = 0;
    await act(async () => { root.render(createElement(RetoForm, { reto, categories: [{ id: 99, nombre: "Otra activa" }], busy: false, onSave: async () => { saves++; }, onCancel: noop })); });
    try {
      await act(async () => { container.querySelector("form")!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); });
      assert.equal(saves, 0);
      assert.match(container.textContent!, /Selecciona una categoría activa/);
    } finally { await act(async () => { root.unmount(); }); }
  });
});
