/**
 * Error de una petición a la API, con el código HTTP y el detalle por campo.
 * La API siempre responde los errores como { error: "mensaje", details?: { campo: "mensaje" } }.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly details: Record<string, string>;

  constructor(status: number, message: string, details: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/** Convierte cualquier error en un texto para mostrar al usuario. */
export const getErrorMessage = (error: unknown, fallback = "Algo salió mal. Intenta de nuevo.") =>
  error instanceof Error && error.message ? error.message : fallback;

const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === "object" &&
  value !== null &&
  Object.values(value).every((item) => typeof item === "string");

/** Lee el cuerpo de una respuesta fallida y arma el ApiError con el mensaje de la API. */
export const toApiError = async (response: Response, fallback: string): Promise<ApiError> => {
  if (response.status >= 500) {
    return new ApiError(
      response.status,
      response.status === 503
        ? "El servidor no está disponible en este momento. Intenta en unos minutos."
        : "El servidor tuvo un problema. Intenta de nuevo.",
    );
  }
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "error" in body) {
      const { error, details } = body as { error: unknown; details?: unknown };
      if (typeof error === "string") {
        return new ApiError(response.status, error, isStringRecord(details) ? details : {});
      }
    }
  } catch {
    // El cuerpo no era JSON: se usa el mensaje genérico
  }
  return new ApiError(response.status, fallback);
};
