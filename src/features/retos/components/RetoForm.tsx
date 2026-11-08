"use client";
import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import { Alert } from "../../common/components/Alert";
import { Button } from "../../common/components/Button";
import { TextField } from "../../common/components/TextField";
import { type Categoria, type Reto, type RetoInput } from "../domain/reto";
import { validateImage, validateReto } from "../domain/validation";
export function RetoForm({
  reto,
  categories,
  busy,
  onSave,
  onCancel,
}: {
  reto?: Reto;
  categories: Categoria[];
  busy: boolean;
  onSave: (input: RetoInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [input, setInput] = useState<RetoInput>(
    reto ?? { nombre: "", descripcion: "", categoriaId: 0, duracionDias: 21 },
  );
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(reto?.imagenUrl ?? "");
  const [reading, setReading] = useState(false);
  const request = useRef(0);
  const imageInput = useRef<HTMLInputElement>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy || reading) return;
    const error = validateReto(input) || (!categories.some((category) => category.id === input.categoriaId) ? "Selecciona una categoría activa." : null);
    setError(error);
    if (!error) void onSave(input);
  };
  return (
    <section
      aria-labelledby="form-title"
      className="rounded-2xl border border-line bg-surface p-5 sm:p-8"
    >
      <h2
        id="form-title"
        tabIndex={-1}
        className="font-display text-2xl font-bold"
      >
        {reto ? "Editar reto" : "Crear reto"}
      </h2>
      <p className="mt-2 text-muted">
        Todos los campos son obligatorios, excepto la imagen.
      </p>
      <form onSubmit={submit} className="mt-6 flex max-w-2xl flex-col gap-5">
        <fieldset disabled={busy} className="flex min-w-0 flex-col gap-5">
          <legend className="sr-only">Datos del reto</legend>
          <TextField
            label="Título"
            required
            maxLength={120}
            value={input.nombre}
            onChange={(event) =>
              setInput({ ...input, nombre: event.target.value })
            }
          />
          <div className="flex flex-col gap-2">
            <label htmlFor="reto-description" className="font-bold">
              Descripción
            </label>
            <textarea
              id="reto-description"
              required
              maxLength={1000}
              rows={5}
              value={input.descripcion}
              onChange={(event) =>
                setInput({ ...input, descripcion: event.target.value })
              }
              className="w-full rounded-lg border border-line p-3"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="reto-category" className="font-bold">
                Categoría
              </label>
              <select
                id="reto-category"
                required
                value={input.categoriaId || ""}
                onChange={(event) =>
                  setInput({ ...input, categoriaId: Number(event.target.value) })
                }
                className="min-h-11 rounded-lg border border-line px-3"
              >
                <option value="">Selecciona una categoría</option>
                {input.categoriaId > 0 && !categories.some((category) => category.id === input.categoriaId) && <option value={input.categoriaId} disabled>Categoría no disponible: selecciona una activa</option>}
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.nombre}</option>
                ))}
              </select>
              {categories.length === 0 && <p role="status">No hay categorías activas disponibles para guardar el reto.</p>}
            </div>
            <TextField
              label="Duración en días"
              type="number"
              required
              min={1}
              max={2147483647}
              step={1}
              value={input.duracionDias}
              onChange={(event) =>
                setInput({ ...input, duracionDias: Number(event.target.value) })
              }
            />
          </div>
          <div className="flex flex-col items-start gap-2">
            <label htmlFor="reto-image" className="font-bold">
              Imagen opcional
            </label>
            <p id="image-hint" className="text-sm text-muted">
              JPEG, PNG o WebP. Máximo 2 MiB.
            </p>
            <input
              ref={imageInput}
              id="reto-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-describedby="image-hint"
              className="min-h-11 w-full min-w-0 text-sm"
              onChange={(event) => {
                const version = ++request.current;
                const file = event.target.files?.[0];
                setReading(false);
                if (!file) { setInput({ ...input, imagen: undefined }); setPreview(reto?.imagenUrl ?? ""); return; }
                const issue = validateImage(file);
                setError(issue);
                if (issue) {
                  event.target.value = "";
                  setInput({ ...input, imagen: undefined });
                  setPreview(reto?.imagenUrl ?? "");
                  return;
                }
                setReading(true);
                setInput((current) => ({ ...current, imagen: undefined }));
                const reader = new FileReader();
                reader.onload = () => {
                  if (request.current === version) {
                    setInput((current) => ({
                      ...current,
                      imagen: file,
                    }));
                    setPreview(String(reader.result));
                    setReading(false);
                  }
                };
                reader.onerror = () => {
                  if (request.current === version) {
                    setError("No se pudo leer la imagen. Selecciona otra.");
                    setReading(false);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            {reading && <p role="status">Preparando vista previa…</p>}
            {preview && (
              <>
                <Image
                  unoptimized
                  width={960}
                  height={540}
                  src={preview}
                  alt="Vista previa de la imagen seleccionada"
                  className="max-h-56 w-full rounded-lg object-contain"
                />
                {input.imagen && <Button
                  variant="secondary"
                  onClick={() => {
                    request.current++;
                    if (imageInput.current) imageInput.current.value = "";
                    setReading(false);
                    setInput({ ...input, imagen: undefined });
                    setPreview(reto?.imagenUrl ?? "");
                  }}
                >
                  Descartar selección
                </Button>}
              </>
            )}
          </div>
        </fieldset>
        {error && <Alert message={error} />}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" isLoading={busy} disabled={reading || categories.length === 0}>
            Guardar reto
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
        </div>
      </form>
    </section>
  );
}
