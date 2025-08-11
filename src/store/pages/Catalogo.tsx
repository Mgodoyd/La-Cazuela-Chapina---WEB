import { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { addTamal, addBebida } from "../store/cartSlice";
import { MASAS, RELLENOS, PICANTES, TAMAL_PRICES, BEBIDA_PRICES, BEBIDAS, ENDULZANTES, TOPPINGS } from "../data";
import type { BebidaSize, BebidaTipo, EndulzanteType, MasaType, PicanteType, RellenoType, TamalSize, ToppingType } from "../types";
import { toast } from "sonner";

export default function Catalogo() {
  const dispatch = useAppDispatch();
  // Tamal
  const [masa, setMasa] = useState<MasaType>("maiz_amarillo");
  const [relleno, setRelleno] = useState<RellenoType>("recado_rojo_cerdo");
  const [envoltura, setEnvoltura] = useState<"platano" | "tusa">("platano");
  const [picante, setPicante] = useState<PicanteType>("sin");
  const [tamalSize, setTamalSize] = useState<TamalSize>("unidad");
  const [tamalQty, setTamalQty] = useState(1);

  // Bebida
  const [bebidaTipo, setBebidaTipo] = useState<BebidaTipo>("atol_elote");
  const [endulzante, setEndulzante] = useState<EndulzanteType>("panela");
  const [topping, setTopping] = useState<ToppingType>("ninguno");
  const [bebidaSize, setBebidaSize] = useState<BebidaSize>("12oz");
  const [bebidaQty, setBebidaQty] = useState(1);

  const addTamalToCart = () => {
    dispatch(
      addTamal({
        config: { masa, relleno, envoltura, picante, size: tamalSize },
        unitPrice: TAMAL_PRICES[tamalSize],
        quantity: tamalQty,
      }),
    );
    toast.success("Tamal agregado");
  };

  const addBebidaToCart = () => {
    dispatch(
      addBebida({
        config: { tipo: bebidaTipo, endulzante, topping, size: bebidaSize },
        unitPrice: BEBIDA_PRICES[bebidaSize],
        quantity: bebidaQty,
      }),
    );
    toast.success("Bebida agregada");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 p-4">
      <div className="space-y-8">
        <section className="border p-4 rounded">
          <h2 className="font-semibold mb-4">Tamales</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Masa
              <select className="block w-full border rounded px-2 py-1" value={masa} onChange={(e) => setMasa(e.target.value as MasaType)}>
                {MASAS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="text-sm">Relleno
              <select className="block w-full border rounded px-2 py-1" value={relleno} onChange={(e) => setRelleno(e.target.value as RellenoType)}>
                {RELLENOS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="text-sm">Envoltura
              <select className="block w-full border rounded px-2 py-1" value={envoltura} onChange={(e) => setEnvoltura(e.target.value as any)}>
                <option value="platano">Hoja de plátano</option>
                <option value="tusa">Tusa de maíz</option>
              </select>
            </label>
            <label className="text-sm">Picante
              <select className="block w-full border rounded px-2 py-1" value={picante} onChange={(e) => setPicante(e.target.value as PicanteType)}>
                {PICANTES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="text-sm">Presentación
              <select className="block w-full border rounded px-2 py-1" value={tamalSize} onChange={(e) => setTamalSize(e.target.value as TamalSize)}>
                <option value="unidad">Unidad (Q {TAMAL_PRICES.unidad})</option>
                <option value="media_docena">1/2 docena (Q {TAMAL_PRICES.media_docena})</option>
                <option value="docena">Docena (Q {TAMAL_PRICES.docena})</option>
              </select>
            </label>
            <label className="text-sm">Cantidad
              <input className="block w-full border rounded px-2 py-1" type="number" min={1} value={tamalQty} onChange={(e) => setTamalQty(Number(e.target.value) || 1)} />
            </label>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <div className="font-semibold">Precio: Q {TAMAL_PRICES[tamalSize].toFixed(2)}</div>
            <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={addTamalToCart}>Agregar</button>
          </div>
        </section>

        <section className="border p-4 rounded">
          <h2 className="font-semibold mb-4">Bebidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Tipo
              <select className="block w-full border rounded px-2 py-1" value={bebidaTipo} onChange={(e) => setBebidaTipo(e.target.value as BebidaTipo)}>
                {BEBIDAS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="text-sm">Endulzante
              <select className="block w-full border rounded px-2 py-1" value={endulzante} onChange={(e) => setEndulzante(e.target.value as EndulzanteType)}>
                {ENDULZANTES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="text-sm">Topping
              <select className="block w-full border rounded px-2 py-1" value={topping} onChange={(e) => setTopping(e.target.value as ToppingType)}>
                {TOPPINGS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="text-sm">Tamaño
              <select className="block w-full border rounded px-2 py-1" value={bebidaSize} onChange={(e) => setBebidaSize(e.target.value as BebidaSize)}>
                <option value="12oz">Vaso 12oz (Q {BEBIDA_PRICES["12oz"]})</option>
                <option value="1L">Jarro 1L (Q {BEBIDA_PRICES["1L"]})</option>
              </select>
            </label>
            <label className="text-sm">Cantidad
              <input className="block w-full border rounded px-2 py-1" type="number" min={1} value={bebidaQty} onChange={(e) => setBebidaQty(Number(e.target.value) || 1)} />
            </label>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <div className="font-semibold">Precio: Q {BEBIDA_PRICES[bebidaSize].toFixed(2)}</div>
            <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={addBebidaToCart}>Agregar</button>
          </div>
        </section>
      </div>
    </div>
  );
} 