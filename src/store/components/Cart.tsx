import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCart, removeLine, selectCartLines, selectCartTotal, setQuantity } from "../store/cartSlice";
import { registerSale } from "../store/salesSlice";
import { toast } from "sonner";

export default function Cart() {
  const lines = useAppSelector(selectCartLines);
  const total = useAppSelector(selectCartTotal);
  const dispatch = useAppDispatch();

  const onCheckout = () => {
    if (lines.length === 0) return;
    dispatch(registerSale({ lines }));
    dispatch(clearCart());
    toast.success("Venta registrada");
  };

  return (
    <aside className="border-l p-4 min-w-80">
      <h2 className="font-semibold mb-2">Carrito</h2>
      <div className="space-y-2">
        {lines.map((l) => (
          <div key={l.id} className="border p-2 rounded">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                {l.kind === "tamal" && (
                  <div>
                    Tamal ({l.config.size}) – {l.config.masa}, {l.config.relleno}, {l.config.envoltura}, {l.config.picante}
                  </div>
                )}
                {l.kind === "bebida" && (
                  <div>
                    Bebida ({l.config.size}) – {l.config.tipo}, {l.config.endulzante}, {l.config.topping}
                  </div>
                )}
                {l.kind === "combo" && <div>Combo – {l.displayName}</div>}
                <div className="text-xs text-gray-500">Q {l.unitPrice.toFixed(2)} c/u</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) => dispatch(setQuantity({ id: l.id, quantity: Number(e.target.value) || 1 }))}
                  className="w-16 border rounded px-2 py-1"
                />
                <button className="text-red-600" onClick={() => dispatch(removeLine(l.id))}>
                  Quitar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between font-semibold">
        <span>Total</span>
        <span>Q {total.toFixed(2)}</span>
      </div>
      <button className="mt-3 bg-blue-600 text-white px-3 py-2 rounded w-full" onClick={onCheckout}>
        Finalizar venta
      </button>
    </aside>
  );
} 