import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { InventoryItem, InventoryMovement } from "../types";
import { loadFromStorage, saveToStorage } from "../utils/localStorage";

interface InventoryState {
  items: InventoryItem[];
  movements: InventoryMovement[];
}

const seed: InventoryItem[] = [
  { id: "masa_maiz", categoria: "materia_prima", nombre: "Masa de maíz", unidad: "kg", stock: 20, costoUnitario: 8 },
  { id: "hojas_platano", categoria: "materia_prima", nombre: "Hojas de plátano", unidad: "unidad", stock: 50, costoUnitario: 0.5 },
  { id: "panela", categoria: "materia_prima", nombre: "Panela", unidad: "kg", stock: 5, costoUnitario: 12 },
  { id: "empaque_tamal", categoria: "empaque", nombre: "Cinta y papel", unidad: "unidad", stock: 100, costoUnitario: 0.2 },
  { id: "gas", categoria: "combustible", nombre: "Gas propano", unidad: "kg", stock: 15, costoUnitario: 7 },
];

const initialState: InventoryState = loadFromStorage<InventoryState>("inventory", { items: seed, movements: [] });

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    upsertItem(state, action: PayloadAction<InventoryItem>) {
      const idx = state.items.findIndex(i => i.id === action.payload.id);
      if (idx >= 0) state.items[idx] = action.payload;
      else state.items.push(action.payload);
    },
    registerMovement(
      state,
      action: PayloadAction<{ itemId: string; tipo: "entrada" | "salida" | "merma"; cantidad: number; costoUnitario?: number; nota?: string }>,
    ) {
      const { itemId, tipo, cantidad, costoUnitario, nota } = action.payload;
      const item = state.items.find(i => i.id === itemId);
      if (!item) return;
      const signedQty = tipo === "entrada" ? cantidad : -cantidad;
      item.stock = Math.max(0, item.stock + signedQty);
      if (tipo === "entrada" && costoUnitario !== undefined) {
        item.costoUnitario = (item.costoUnitario + costoUnitario) / 2;
      }
      state.movements.push({ id: nanoid(), itemId, tipo, cantidad, costoUnitario, fecha: new Date().toISOString(), nota });
    },
  },
});

export const { upsertItem, registerMovement } = inventorySlice.actions;
export default inventorySlice.reducer;

export const persistInventory = (state: { inventory: InventoryState }) => saveToStorage("inventory", state.inventory);
export const selectInventory = (s: { inventory: InventoryState }) => s.inventory.items;
export const selectMovements = (s: { inventory: InventoryState }) => s.inventory.movements; 