/**
 * URL base de la API, incluido el /api final. Sale de la variable NEXT_PUBLIC_API_HOST:
 *   - en local (.env.local):  NEXT_PUBLIC_API_HOST=http://localhost:3001/api
 *   - en Vercel:              NEXT_PUBLIC_API_HOST=https://<api-en-render>/api
 * Si no está definida se usa la API local, para poder trabajar sin configurar nada.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3000/api"
).replace(/\/+$/, "");