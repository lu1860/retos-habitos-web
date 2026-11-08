import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_IMAGE_BYTES, validateImage, validateReto } from "./validation.ts";
test("acepta JPEG, PNG y WebP hasta el límite exacto", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"])
    assert.equal(validateImage({ type, size: MAX_IMAGE_BYTES }), null);
});
test("rechaza imágenes vacías, formatos no permitidos y exceso de tamaño", () => {
  assert.ok(validateImage({ type: "image/gif", size: 100 }));
  assert.ok(validateImage({ type: "image/png", size: MAX_IMAGE_BYTES + 1 }));
  assert.ok(validateImage({ type: "image/jpeg", size: 0 }));
});
test("valida contenido y duración de los formularios", () => {
  const valid = {
    nombre: "Leer",
    descripcion: "Un capítulo diario",
    categoriaId: 1,
    duracionDias: 21,
  };
  assert.equal(validateReto(valid), null);
  for (const duracionDias of [0, 2147483648, 1.5, NaN])
    assert.ok(validateReto({ ...valid, duracionDias }));
  assert.ok(validateReto({ ...valid, nombre: "  " }));
  assert.ok(validateReto({ ...valid, descripcion: "" }));
  assert.ok(validateReto({ ...valid, categoriaId: 0 }));
});
