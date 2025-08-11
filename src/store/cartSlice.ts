import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CartLine, TamalConfig, BebidaConfig } from "../types";
import { loadFromStorage, saveToStorage } from "../utils/localStorage";

interface CartState {
  lines: CartLine[];
}

const initialState: CartState = loadFromStorage<CartState>("cart", { lines: [] });

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addTamal(state, action: PayloadAction<{ config: TamalConfig; unitPrice: number; quantity?: number }>) {
      const { config, unitPrice, quantity = 1 } = action.payload;
      state.lines.push({ id: nanoid(), kind: "tamal", config, unitPrice, quantity });
    },
    addBebida(state, action: PayloadAction<{ config: BebidaConfig; unitPrice: number; quantity?: number }>) {
      const { config, unitPrice, quantity = 1 } = action.payload;
      state.lines.push({ id: nanoid(), kind: "bebida", config, unitPrice, quantity });
    },
    addCombo(state, action: PayloadAction<{ comboId: string; displayName: string; unitPrice: number; quantity?: number }>) {
      const { comboId, displayName, unitPrice, quantity = 1 } = action.payload;
      state.lines.push({ id: nanoid(), kind: "combo", comboId, displayName, unitPrice, quantity });
    },
    setQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const line = state.lines.find(l => l.id === action.payload.id);
      if (line) line.quantity = Math.max(1, action.payload.quantity);
    },
    removeLine(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter(l => l.id !== action.payload);
    },
    clearCart(state) {
      state.lines = [];
    },
  },
});

export const { addTamal, addBebida, addCombo, setQuantity, removeLine, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const persistCartMiddleware = (state: { cart: CartState }) => {
  saveToStorage("cart", state.cart);
};

export const selectCartLines = (s: { cart: CartState }) => s.cart.lines;
export const selectCartTotal = (s: { cart: CartState }) => s.cart.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0); 