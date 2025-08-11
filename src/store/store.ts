import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { persistCartMiddleware } from "./cartSlice";
import combosReducer, { persistCombos } from "./combosSlice";
import inventoryReducer, { persistInventory } from "./inventorySlice";
import salesReducer, { persistSales } from "./salesSlice";
import authReducer, { persistAuth } from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    combos: combosReducer,
    inventory: inventoryReducer,
    sales: salesReducer,
  },
  devTools: true,
});

store.subscribe(() => {
  const state = store.getState();
  persistAuth(state as any);
  persistCartMiddleware(state as any);
  persistCombos(state as any);
  persistInventory(state as any);
  persistSales(state as any);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 