import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const initialState: AuthState = {
  id: localStorage.getItem("id") ? parseInt(localStorage.getItem("id")!) : null,
  user: null,
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  loading: false,
  error: null,
  success: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401)
          return rejectWithValue(
            "Credenciales incorrectas. Verifica tu email y contraseña."
          );
        if (response.status === 404)
          return rejectWithValue("Usuario no encontrado. Verifica tu email.");
        if (response.status === 400)
          return rejectWithValue(data.message || "Datos de entrada inválidos.");
        if (response.status >= 500)
          return rejectWithValue("Error del servidor. Intenta más tarde.");
      }

      return data as AuthResponse;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("fetch")) return rejectWithValue("Error de conexión. Verifica tu internet.");
        
        return rejectWithValue("Error inesperado. Intenta nuevamente.");
      }
      return rejectWithValue("Error desconocido.");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      const currentRefreshToken = state.auth.refreshToken;
      const currentToken = state.auth.token;

      if (!currentRefreshToken) return rejectWithValue("No hay refresh token disponible");
     

      const response = await fetch(`${API_URL}/user/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          RefreshToken: currentRefreshToken,
          Token: currentToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) return rejectWithValue("Refresh token expirado o inválido. Debes iniciar sesión nuevamente.");
        if (response.status === 400) return rejectWithValue(
            data.Error || data.message || "Token inválido."
          );
        if (response.status >= 500) return rejectWithValue("Error del servidor. Intenta más tarde.");
        return rejectWithValue(
            data.Error || data.message || "Error al refrescar el token."
          );
      }
      return data as AuthResponse;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("fetch")) return rejectWithValue("Error de conexión. Verifica tu internet.");
        return rejectWithValue("Error inesperado. Intenta nuevamente.");
      }
      return rejectWithValue("Error desconocido.");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const userDataWithRole = {
        ...userData,
        role: "Customer" as const,
      };

      const response = await fetch(`${API_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDataWithRole),
      });

      const data = await response.json();

      if (!response.ok) { 
        if (response.status === 400) return rejectWithValue("El email ya está registrado. Usa otro email o inicia sesión.");
        if (response.status >= 500) return rejectWithValue("Error del servidor. Intenta más tarde.");
        return rejectWithValue(data.message || "Error al crear la cuenta.");
      }

      return data as AuthResponse;
    } catch (error) {
      if (error instanceof Error) { 
        if (error.message.includes("fetch")) return rejectWithValue("Error de conexión. Verifica tu internet.");
        return rejectWithValue("Error inesperado. Intenta nuevamente.");
      }
      return rejectWithValue("Error desconocido.");
    }
  }
);

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const refreshToken = localStorage.getItem("refreshToken");
      const id = localStorage.getItem("id");

      if (!token || !userData) return rejectWithValue("No hay sesión activa");
      

      const user = JSON.parse(userData);
      return { token, user, refreshToken, id: id ? parseInt(id) : null };
    } catch (error) {
      return rejectWithValue("Error al restaurar la sesión");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.id = null;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("id");
      const chatSessionKey = Object.keys(localStorage).find((key) =>
        key.startsWith("chatSession_")
      );
      if (chatSessionKey) {
        localStorage.removeItem(chatSessionKey);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          id: action.payload.data.id,
          name: action.payload.data.name,
          email: action.payload.data.email,
          role: action.payload.data.role,
        };

        state.token = action.payload.data.token;
        state.refreshToken = action.payload.data.refreshToken;
        localStorage.setItem("token", action.payload.data.token);
        localStorage.setItem("user", JSON.stringify(state.user));
        localStorage.setItem("refreshToken", action.payload.data.refreshToken);
        localStorage.setItem("id", action.payload.data.id.toString());
        console.log(
          "Slice: state updated - user:",
          state.user,
          "token:",
          state.token
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Error al iniciar sesión.";
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          name: action.payload.data.name,
          email: action.payload.data.email,
          role: action.payload.data.role,
        };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Error al crear la cuenta.";
      })
      // Restore Session
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.id = action.payload.id;
        state.loading = false;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload.data || action.payload;
        const newToken =
          (responseData as any).token ||
          (responseData as any).Token ||
          (responseData as any).accessToken;
        const newRefreshToken =
          (responseData as any).refreshToken ||
          (responseData as any).RefreshToken;

        if (!newToken || !newRefreshToken) {
          state.error = "Error: Tokens no válidos en la respuesta del servidor";
          return;
        }

        state.token = newToken;
        state.refreshToken = newRefreshToken;
        state.error = null;

        try {
          localStorage.setItem("token", newToken);
          localStorage.setItem("refreshToken", newRefreshToken);
        } catch (error) {
          console.error("❌ Error al guardar tokens en localStorage:", error);
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Error al refrescar el token";
        state.token = null;
        state.refreshToken = null;
        localStorage.clean()
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
