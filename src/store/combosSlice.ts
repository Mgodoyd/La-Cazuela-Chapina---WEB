import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Combo } from "../types";
import { loadFromStorage, saveToStorage } from "../utils/localStorage";

interface CombosState {
  combos: Combo[];
}

const defaults: Combo[] = [
  {
    id: "familiar_fiesta_patronal",
    nombre: "Combo Familiar – Fiesta Patronal",
    descripcion: "Docena surtida de tamales + 2 jarros familiares",
    items: [
      { kind: "tamal", quantity: 12 },
      { kind: "bebida", quantity: 2, bebidaPreset: { size: "1L" } },
    ],
    precio: 320,
  },
  {
    id: "eventos_madrugada_24",
    nombre: "Combo Eventos – Madrugada del 24",
    descripcion: "3 docenas + 4 jarros + termo conmemorativo",
    items: [
      { kind: "tamal", quantity: 36 },
      { kind: "bebida", quantity: 4, bebidaPreset: { size: "1L" } },
    ],
    precio: 860,
  },
];

const initialState: CombosState = loadFromStorage<CombosState>("combos", { combos: defaults });

const combosSlice = createSlice({
  name: "combos",
  initialState,
  reducers: {
    upsertCombo(state, action: PayloadAction<Combo>) {
      const idx = state.combos.findIndex(c => c.id === action.payload.id);
      if (idx >= 0) state.combos[idx] = action.payload;
      else state.combos.push(action.payload);
    },
    removeCombo(state, action: PayloadAction<string>) {
      state.combos = state.combos.filter(c => c.id !== action.payload);
    },
  },
});

export const { upsertCombo, removeCombo } = combosSlice.actions;
export default combosSlice.reducer;

export const persistCombos = (state: { combos: CombosState }) => saveToStorage("combos", state.combos);
export const selectCombos = (s: { combos: CombosState }) => s.combos.combos; 