import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { act, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
let createRoot: typeof import("react-dom/client").createRoot;

// Compila TSX solo en pruebas usando TypeScript, ya instalado en el proyecto.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/navigation") return { shortCircuit: true, url: "data:text/javascript,export const useSearchParams = () => new URLSearchParams();" };
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
const { RetosView } = await import("./RetosView.tsx");
const { RetoImage } = await import("./RetoImage.tsx");
const { SessionContext } = await import("../../auth/hooks/useSession.ts");
const { ApiError } = await import("../../common/services/api-error.ts");
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
  try {
    // Inicializa el sistema de eventos del cliente con un DOM disponible.
    createRoot = (await import("react-dom/client")).createRoot;
    await run(dom.window.document.getElementById("root")!, dom);
  }
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

const session = { status: "authenticated" as const, user: { id: 5, nombre: "Prueba local", email: "fixture@example.invalid", rol: "user" as const, status: "ACTIVE" as const, createdAt: reto.createdAt }, isAdmin: false, login: async () => {}, register: async () => {}, logout: noop };
const view = () => createElement(SessionContext.Provider, { value: session }, createElement(RetosView));
const buttonByText = (container: HTMLElement, text: string) => [...container.querySelectorAll("button")].find(b => b.textContent?.trim() === text)!;
const click = (container: HTMLElement, text: string) => act(async () => { buttonByText(container, text).click(); });
const settleList = () => act(async () => { await new Promise(resolve => setTimeout(resolve, 280)); });

test("contador del listado presenta cero, singular y plural", async () => {
  await withDOM(async container => {
    mock.method(retosService, "categories", async () => []);
    const list = mock.method(retosService, "list");
    for (const [total, expected] of [[0, "0 retos encontrados"], [1, "1 reto encontrado"], [2, "2 retos encontrados"]] as const) {
      list.mock.mockImplementation(async () => ({ data: [], pagination: { total, currentPage: 1, totalPages: 1, limit: 6 } }));
      const root = createRoot(container);
      try {
        await act(async () => { root.render(view()); });
        await settleList();
        assert.equal(container.querySelector('[role="status"]')?.textContent, expected);
      } finally { await act(async () => { root.unmount(); }); }
    }
  });
});

test("imagen fallida muestra alternativa accesible y reintenta al cambiar URL", async () => {
  await withDOM(async (container, dom) => {
    const root = createRoot(container);
    try {
      await act(async () => { root.render(createElement(RetoImage, { src: "https://example.invalid/uno.png", alt: "Reto de lectura", className: "h-44" })); });
      assert.equal(container.querySelector("img")?.getAttribute("src"), "https://example.invalid/uno.png");
      await act(async () => { container.querySelector("img")!.dispatchEvent(new dom.window.Event("error")); });
      assert.equal(container.querySelector("img"), null);
      assert.match(container.querySelector('[role="img"]')!.getAttribute("aria-label")!, /no disponible/);
      await act(async () => { root.render(createElement(RetoImage, { src: "https://example.invalid/dos.png", alt: "Otro reto", className: "h-44" })); });
      assert.equal(container.querySelector("img")?.getAttribute("src"), "https://example.invalid/dos.png");
    } finally { await act(async () => { root.unmount(); }); }
  });
});

test("imagen existente fallida en edición conserva formulario y permite seleccionar reemplazo local", async () => {
  await withDOM(async (container, dom) => {
    const root = createRoot(container);
    await act(async () => { root.render(createElement(RetoForm, { reto: { ...reto, imagenUrl: "https://example.invalid/original.png" }, categories: [{ id: 3, nombre: "Lectura" }], busy: false, onSave: async () => assert.fail("No debe guardar"), onCancel: noop })); });
    try {
      await act(async () => { container.querySelector("img")!.dispatchEvent(new dom.window.Event("error")); });
      assert.match(container.textContent!, /Imagen no disponible/);
      assert.equal(buttonByText(container, "Guardar reto").disabled, false);
      const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
      Object.defineProperty(input, "files", { value: [new dom.window.File(["local"], "nuevo.png", { type: "image/png" })] });
      await act(async () => { input.dispatchEvent(new dom.window.Event("change", { bubbles: true })); await new Promise(resolve => setTimeout(resolve, 30)); });
      assert.match(container.querySelector("img")!.getAttribute("src")!, /^data:image\/png;base64,/);
      assert.ok(buttonByText(container, "Descartar selección"));
    } finally { await act(async () => { root.unmount(); }); }
  });
});

test("selector acepta PNG JPEG WebP, rechaza formato y tamaño, y muestra mensajes sin guardar", async () => {
  await withDOM(async (container, dom) => {
    const root = createRoot(container);
    let saves = 0;
    await act(async () => { root.render(createElement(RetoForm, { reto, categories: [{ id: 3, nombre: "Lectura" }], busy: false, onSave: async () => { saves++; }, onCancel: noop })); });
    try {
      const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
      for (const type of ["image/png", "image/jpeg", "image/webp", "image/gif", "oversize"]) {
        const file = new dom.window.File([type === "oversize" ? new Uint8Array(2 * 1024 * 1024 + 1) : "local"], "fixture", { type: type === "oversize" ? "image/png" : type });
        Object.defineProperty(input, "files", { configurable: true, value: [file] });
        await act(async () => {
          input.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
          await new Promise(resolve => setTimeout(resolve, 30));
        });
        if (type === "image/gif" || type === "oversize") {
          assert.match(container.textContent!, type === "oversize" ? /no puede superar 2 MiB/ : /Selecciona una imagen JPEG, PNG o WebP/);
          assert.equal(container.querySelector("img"), null);
        } else {
          assert.match(container.querySelector("img")!.getAttribute("src")!, new RegExp(`^data:${type};base64,`));
          await click(container, "Descartar selección");
          assert.equal(container.querySelector("img"), null);
        }
      }
      assert.equal(saves, 0);
    } finally { await act(async () => { root.unmount(); }); }
  });
});

test("formulario ocupado y lectura de archivo impiden guardar; vacío muestra validación", async () => {
  await withDOM(async (container, dom) => {
    const root = createRoot(container);
    let saves = 0;
    const props = { categories: [{ id: 3, nombre: "Lectura" }], busy: true, onSave: async () => { saves++; }, onCancel: noop };
    const submit = () => act(async () => { container.querySelector("form")!.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); });
    try {
      await act(async () => { root.render(createElement(RetoForm, props)); });
      assert.equal(container.querySelector("fieldset")!.disabled, true);
      assert.equal(buttonByText(container, "Cancelar").disabled, true);
      await submit(); assert.equal(saves, 0);
      await act(async () => { root.render(createElement(RetoForm, { ...props, busy: false })); });
      await submit(); assert.match(container.textContent!, /El título es obligatorio/);
      mock.method(globalThis, "FileReader", class extends dom.window.FileReader { readAsDataURL() {} });
      const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
      Object.defineProperty(input, "files", { value: [new dom.window.File(["x"], "local.png", { type: "image/png" })] });
      await act(async () => { input.dispatchEvent(new dom.window.Event("change", { bubbles: true })); });
      assert.match(container.textContent!, /Preparando vista previa/);
      assert.equal(buttonByText(container, "Guardar reto").disabled, true);
      await submit(); assert.equal(saves, 0);
    } finally { await act(async () => { root.unmount(); }); }
  });
});

test("paginación recorre primera siguiente anterior última y reinicia con filtros búsqueda y vacío", async () => {
  await withDOM(async (container, dom) => {
    const root = createRoot(container);
    mock.method(retosService, "categories", async () => [{ id: 3, nombre: "Lectura" }]);
    const list = mock.method(retosService, "list", async (query: NonNullable<Parameters<typeof retosService.list>[0]> = {}) => ({ data: query.q === "vacío" ? [] : [reto], pagination: { currentPage: query.page ?? 1, total: query.q === "vacío" ? 0 : 13, totalPages: query.q === "vacío" ? 0 : 3, limit: 6 } }));
    try {
      await act(async () => { root.render(view()); }); await settleList();
      assert.equal(buttonByText(container, "Anterior").disabled, true);
      await click(container, "Siguiente"); await settleList();
      assert.equal(list.mock.calls.at(-1)!.arguments[0]!.page, 2);
      await click(container, "Anterior"); await settleList();
      assert.equal(list.mock.calls.at(-1)!.arguments[0]!.page, 1);
      await click(container, "Siguiente"); await settleList();
      await click(container, "Siguiente"); await settleList();
      assert.equal(buttonByText(container, "Siguiente").disabled, true);
      await act(async () => { const select = container.querySelector<HTMLSelectElement>("#filter-category")!; select.value = "3"; select.dispatchEvent(new dom.window.Event("change", { bubbles: true })); }); await settleList();
      assert.equal(list.mock.calls.at(-1)!.arguments[0]!.page, 1);
      assert.equal(list.mock.calls.at(-1)!.arguments[0]!.categoriaId, 3);
      await click(container, "Siguiente"); await settleList();
      await act(async () => {
        const input = container.querySelector<HTMLInputElement>('input[type="search"]')!;
        Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, "value")!.set!.call(input, "vacío");
        input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
      }); await settleList();
      assert.equal(list.mock.calls.at(-1)!.arguments[0]!.page, 1);
      assert.match(container.textContent!, /No hay retos que coincidan/);
      assert.equal(container.querySelector('nav[aria-label="Paginación"]'), null);
    } finally { await act(async () => { root.unmount(); }); }
  });
});

test("participación real del componente usa mocks: éxito, duplicada, autorización, red, carga y recarga desconocida", async () => {
  await withDOM(async container => {
    let root = createRoot(container);
    mock.method(retosService, "categories", async () => [{ id: 3, nombre: "Lectura" }]);
    mock.method(retosService, "list", async () => ({ data: [reto], pagination: { total: 1, currentPage: 1, totalPages: 1, limit: 6 } }));
    mock.method(retosService, "detail", async () => reto);
    const join = mock.method(retosService, "join");
    const leave = mock.method(retosService, "leave", async () => {});
    const open = async () => { await act(async () => { root.render(view()); }); await settleList(); await click(container, "Ver detalle"); };
    try {
      await open();
      for (const error of [new ApiError(409, "Participación duplicada"), new ApiError(403, "Sin autorización"), new ApiError(401, "Sesión vencida"), new Error("Sin conexión")]) {
        join.mock.mockImplementation(async () => { throw error; });
        await click(container, "Confirmar unión");
        assert.match(container.textContent!, /Participación desconocida/);
        assert.ok(container.textContent!.includes(error.message));
      }
      let finish!: () => void;
      join.mock.mockImplementation(() => new Promise(resolve => { finish = () => resolve({ id: 1, usuarioId: 5, retoId: 90, fechaUnion: reto.createdAt, status: "ACTIVE" }); }));
      await click(container, "Confirmar unión");
      assert.equal(buttonByText(container, "Abandonar reto").disabled, true);
      await act(async () => { finish(); });
      assert.match(container.textContent!, /Participación confirmada/);
      assert.equal(buttonByText(container, "Confirmar unión"), undefined);
      leave.mock.mockImplementation(async () => { throw new Error("Sin conexión al abandonar"); });
      await click(container, "Abandonar reto");
      assert.match(container.textContent!, /Participación confirmada/);
      assert.match(container.textContent!, /Sin conexión al abandonar/);
      leave.mock.mockImplementation(async () => {});
      await click(container, "Abandonar reto");
      assert.match(container.textContent!, /Abandono confirmado/);
      await act(async () => { root.unmount(); }); root = createRoot(container);
      await open(); assert.match(container.textContent!, /Participación desconocida/);
    } finally { await act(async () => { root.unmount(); }); }
  });
});
