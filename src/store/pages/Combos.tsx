import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectCombos, upsertCombo } from "../store/combosSlice";
import { addCombo } from "../store/cartSlice";

export default function CombosPage() {
  const combos = useAppSelector(selectCombos);
  const dispatch = useAppDispatch();

  const [id, setId] = useState("combo_estacional");
  const [nombre, setNombre] = useState("Combo Estacional");
  const [precio, setPrecio] = useState(280);
  const [tamales, setTamales] = useState(12);
  const [jarros, setJarros] = useState(2);

  const guardar = () => {
    dispatch(
      upsertCombo({
        id,
        nombre,
        descripcion: "Editable en producción",
        precio,
        estacional: true,
        items: [
          { kind: "tamal", quantity: tamales },
          { kind: "bebida", quantity: jarros, bebidaPreset: { size: "1L" } },
        ],
      }),
    );
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      <section>
        <h2 className="font-semibold mb-2">Combos disponibles</h2>
        <div className="space-y-3">
          {combos.map((c) => (
            <div key={c.id} className="border p-3 rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{c.nombre}</div>
                <div className="text-sm text-gray-600">Q {c.precio.toFixed(2)}</div>
                {c.descripcion && <div className="text-xs text-gray-500">{c.descripcion}</div>}
              </div>
              <button
                className="bg-blue-600 text-white px-3 py-2 rounded"
                onClick={() => dispatch(addCombo({ comboId: c.id, displayName: c.nombre, unitPrice: c.precio }))}
              >
                Agregar al carrito
              </button>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="font-semibold mb-2">Combo estacional</h2>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">ID
            <input className="block w-full border rounded px-2 py-1" value={id} onChange={(e) => setId(e.target.value)} />
          </label>
          <label className="text-sm">Nombre
            <input className="block w-full border rounded px-2 py-1" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
          <label className="text-sm">Precio
            <input className="block w-full border rounded px-2 py-1" type="number" value={precio} onChange={(e) => setPrecio(Number(e.target.value) || 0)} />
          </label>
          <label className="text-sm">Tamales (uds)
            <input className="block w-full border rounded px-2 py-1" type="number" value={tamales} onChange={(e) => setTamales(Number(e.target.value) || 0)} />
          </label>
          <label className="text-sm">Jarros 1L
            <input className="block w-full border rounded px-2 py-1" type="number" value={jarros} onChange={(e) => setJarros(Number(e.target.value) || 0)} />
          </label>
        </div>
        <button className="mt-3 bg-green-600 text-white px-3 py-2 rounded" onClick={guardar}>Guardar</button>
      </section>
    </div>
  );
} 