import { store } from "../../global";
import { refreshToken, logout } from "../../global/authSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5266/api/v1";

export class ApiService {
  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<Response> {
    const url = `${API_URL}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (requireAuth) {
      const state = store.getState();
      const token = state.auth.token;

      if (!token) throw new Error("No hay token de autorización disponible");

      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && requireAuth) {
      try {
        await store.dispatch(refreshToken()).unwrap();

        const newState = store.getState();
        const newToken = newState.auth.token;

        if (newToken) {
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };

          const retryResponse = await fetch(url, {
            ...options,
            headers: newHeaders,
          });

          if (retryResponse.ok) {
            return retryResponse;
          } else {
            store.dispatch(logout());
            throw new Error(
              "Token inválido después del refresh. Sesión cerrada."
            );
          }
        } else {
          store.dispatch(logout());
          throw new Error("No se pudo obtener nuevo token. Sesión cerrada.");
        }
      } catch (error) {
        console.log("❌ Error al refrescar token:", error);
        store.dispatch(logout());
      }
    }
    return response;
  }

  // Método para GET requests
  static async get(
    endpoint: string,
    requireAuth: boolean = true
  ): Promise<any> {
    const response = await this.makeRequest(
      endpoint,
      { method: "GET" },
      requireAuth
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Método para POST requests
  static async post(
    endpoint: string,
    data: any,
    requireAuth: boolean = true
  ): Promise<any> {
    const response = await this.makeRequest(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      requireAuth
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Método para streaming (como el AI service)
  static async stream(
    endpoint: string,
    data: any,
    requireAuth: boolean = true
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await this.makeRequest(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      requireAuth
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body available");
    }

    return response.body;
  }
}
