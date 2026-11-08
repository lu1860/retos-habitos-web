export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export function validateImage(file: {
  type: string;
  size: number;
}): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return "Selecciona una imagen JPEG, PNG o WebP.";
  if (file.size > MAX_IMAGE_BYTES) return "La imagen no puede superar 2 MiB.";
  if (file.size === 0) return "La imagen está vacía.";
  return null;
}
export function validateReto(input: {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  duracionDias: number;
}): string | null {
  if (!input.nombre.trim() || input.nombre.trim().length > 120)
    return "El título es obligatorio y admite hasta 120 caracteres.";
  if (!input.descripcion.trim() || input.descripcion.trim().length > 1000)
    return "La descripción es obligatoria y admite hasta 1000 caracteres.";
  if (!Number.isInteger(input.categoriaId) || input.categoriaId < 1 || input.categoriaId > 2147483647) return "Selecciona una categoría.";
  if (
    !Number.isInteger(input.duracionDias) ||
    input.duracionDias < 1 ||
    input.duracionDias > 2147483647
  )
    return "La duración debe ser un número entero entre 1 y 2147483647 días.";
  return null;
}
