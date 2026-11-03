import type { DataResponse } from "../../common/domain/pagination";
import { apiRequest } from "../../common/services/http";
import type { AuthResult, LoginCredentials, RegisterPayload, User } from "../domain/auth";

/** Llamadas a la API de autenticación. Los componentes no las usan directo: pasan por useSession. */
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { data } = await apiRequest<DataResponse<AuthResult>>("/auth/login", {
      method: "POST",
      body: credentials,
      auth: false,
      errorMessage: "No se pudo iniciar sesión.",
    });
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResult> {
    const { data } = await apiRequest<DataResponse<AuthResult>>("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
      errorMessage: "No se pudo crear la cuenta.",
    });
    return data;
  },

  /** Usuario del token actual. Si el token ya no sirve, la API responde 401 y se cierra la sesión. */
  async me(): Promise<User> {
    const { data } = await apiRequest<DataResponse<User>>("/auth/me");
    return data;
  },
};
