import { store } from "../../global";
import { refreshToken, logout } from "../../global/authSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5266/api/v1";
const REFRESH_URL = `${API_URL}/user/refresh`;

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
        // Intento manual de refresh para mayor compatibilidad con el backend
        const stateBefore = store.getState();
        const currentToken = stateBefore.auth.token;
        const currentRefreshToken = stateBefore.auth.refreshToken;

        if (!currentRefreshToken) throw new Error("No refresh token");

        const refreshResp = await fetch(REFRESH_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ RefreshToken: currentRefreshToken, Token: currentToken })
        });

        if (!refreshResp.ok) {
          store.dispatch(logout());
          throw new Error(`Refresh failed ${refreshResp.status}`);
        }

        const refreshData = await refreshResp.json();
        const refreshedToken = refreshData?.data?.token || refreshData?.token || refreshData?.Token || refreshData?.accessToken;
        const refreshedRefresh = refreshData?.data?.refreshToken || refreshData?.refreshToken || refreshData?.RefreshToken;

        if (!refreshedToken || !refreshedRefresh) {
          store.dispatch(logout());
          throw new Error('Invalid refresh response');
        }

        // Persistir en store/localStorage a través del thunk existente (mantener compatibilidad)
        await store.dispatch(refreshToken()).catch(()=>{});

        const newState = store.getState();
        const tokenAfter = newState.auth.token;

        if (tokenAfter) {
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${tokenAfter}`,
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

  // Método para PUT requests
  static async put(
    endpoint: string,
    data: any,
    requireAuth: boolean = true
  ): Promise<any> {
    const response = await this.makeRequest(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      requireAuth
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Método para DELETE requests
  static async delete(
    endpoint: string,
    requireAuth: boolean = true
  ): Promise<any> {
    const response = await this.makeRequest(
      endpoint,
      {
        method: "DELETE",
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
