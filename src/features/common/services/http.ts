import { sessionStore } from "../../auth/services/session.store";
import { API_BASE_URL } from "../config";
import { ApiError, toApiError } from "./api-error";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  /** Objeto que se envía como JSON, o un FormData (por ejemplo, para subir una imagen). */
  body?: unknown;
  /** Mensaje si la API no explica el error. */
  errorMessage?: string;
  /** false para no enviar el token (login y registro). Por defecto, true. */
  auth?: boolean;
}

/**
 * Cliente HTTP centralizado: TODAS las peticiones a la API pasan por aquí.
 * Ningún componente llama a fetch directamente; los services usan esta función.
 *
 * Se encarga de:
 *  - armar la URL con NEXT_PUBLIC_API_HOST,
 *  - enviar el body como JSON (o como FormData, sin tocar el Content-Type),
 *  - agregar el token de la sesión en "Authorization: Bearer <token>",
 *  - convertir los errores de la API en un ApiError con el mensaje para el usuario,
 *  - si la API responde 401 con una sesión abierta (token vencido o inválido),
 *    cerrar la sesión (PrivateRoute lleva entonces al login).
 *
 *   const respuesta = await apiRequest<DataResponse<Reto>>("/retos/1");
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    errorMessage = "No se pudo completar la operación.",
    auth = true,
  } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";

  const token = auth ? sessionStore.getToken() : null;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.",
    );
  }

  if (!response.ok) {
    // 401 con sesión abierta: el token venció o ya no sirve. Al cerrar la sesión,
    // PrivateRoute lleva al login con el aviso de sesión terminada.
    if (response.status === 401 && token) sessionStore.clear(true);
    throw await toApiError(response, errorMessage);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
