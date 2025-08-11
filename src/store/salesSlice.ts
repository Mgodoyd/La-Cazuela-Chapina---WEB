import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartLine } from "../types";
import { loadFromStorage, saveToStorage } from "../utils/localStorage";

export interface Sale {
  id: string;
  createdAt: string; // ISO
  lines: CartLine[];
  total: number;
}

interface SalesState {
  sales: Sale[];
}

const initialState: SalesState = loadFromStorage<SalesState>("sales", { sales: [] });

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    registerSale(state, action: PayloadAction<{ lines: CartLine[] }>) {
      const total = action.payload.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
      state.sales.push({ id: nanoid(), createdAt: new Date().toISOString(), lines: action.payload.lines, total });
    },
    clearSales(state) {
      state.sales = [];
    },
  },
});

export const { registerSale, clearSales } = salesSlice.actions;
export default salesSlice.reducer;

export const persistSales = (state: { sales: SalesState }) => saveToStorage("sales", state.sales);
export const selectSales = (s: { sales: SalesState }) => s.sales.sales; 