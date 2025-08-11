import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { loadFromStorage, saveToStorage } from "../utils/localStorage";

export type Role = "admin" | "venta";

export interface AuthState {
  isAuthenticated: boolean;
  role: Role | null;
  name: string | null;
  token: string | null;
}

const initialState: AuthState = loadFromStorage<AuthState>("auth", {
  isAuthenticated: false,
  role: null,
  name: null,
  token: null,
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ role: Role; name: string; token: string }>) {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.name = action.payload.name;
      state.token = action.payload.token;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.role = null;
      state.name = null;
      state.token = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

export const persistAuth = (state: { auth: AuthState }) => saveToStorage("auth", state.auth);
export const selectIsAuthenticated = (s: { auth: AuthState }) => s.auth.isAuthenticated;
export const selectRole = (s: { auth: AuthState }) => s.auth.role;
export const selectUserName = (s: { auth: AuthState }) => s.auth.name; 