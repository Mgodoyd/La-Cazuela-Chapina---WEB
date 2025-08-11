import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerMovement, selectInventory, selectMovements } from "../store/inventorySlice";

export default function InventarioPage() {
  const items = useAppSelector(selectInventory);
  const movements = useAppSelector(selectMovements);
  const dispatch = useAppDispatch();

  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [tipo, setTipo] = useState<"entrada" | "salida" | "merma">("entrada");
  const [cantidad, setCantidad] = useState(1);
  const [costo, setCosto] = useState<number | "">("");

  const registrar = () => {
    if (!itemId || cantidad <= 0) return;
    dispatch(registerMovement({ itemId, tipo, cantidad, costoUnitario: costo === "" ? undefined : Number(costo) }));
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      <section>
        <h2 className="font-semibold mb-2">Stock</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b"><th>Nombre</th><th>Cat</th><th>Stock</th><th>Costo</th></tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-b">
                <td>{i.nombre}</td>
                <td className="capitalize">{i.categoria.replace("_", " ")}</td>
                <td>{i.stock} {i.unidad}</td>
                <td>Q {i.costoUnitario.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="font-semibold mb-2">Registrar movimiento</h2>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">Item
            <select className="block w-full border rounded px-2 py-1" value={itemId} onChange={(e) => setItemId(e.target.value)}>
              {items.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
          </label>
          <label className="text-sm">Tipo
            <select className="block w-full border rounded px-2 py-1" value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="merma">Merma</option>
            </select>
          </label>
          <label className="text-sm">Cantidad
            <input className="block w-full border rounded px-2 py-1" type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value) || 1)} />
          </label>
          <label className="text-sm">Costo unitario (si entrada)
            <input className="block w-full border rounded px-2 py-1" type="number" value={costo} onChange={(e) => setCosto(e.target.value === "" ? "" : Number(e.target.value))} />
          </label>
        </div>
        <button className="mt-3 bg-blue-600 text-white px-3 py-2 rounded" onClick={registrar}>Registrar</button>
      </section>
      <section className="md:col-span-2">
        <h2 className="font-semibold mb-2">Movimientos</h2>
        <div className="border rounded divide-y">
          {movements.slice().reverse().map(m => (
            <div key={m.id} className="p-2 text-sm flex gap-3">
              <div className="w-40">{new Date(m.fecha).toLocaleString()}</div>
              <div className="capitalize w-20">{m.tipo}</div>
              <div>{m.cantidad}</div>
              {m.costoUnitario !== undefined && <div>Q {m.costoUnitario.toFixed(2)}</div>}
              {m.nota && <div className="text-gray-500">{m.nota}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 