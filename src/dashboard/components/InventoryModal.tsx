import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { InventoryService } from '../services/inventoryService';
import type {
  InventoryItem,
  RawMaterialCreate,
} from '../types/inventory';
import type { InventoryModalProps } from '../types/modals';
import { ModalFrame, ModalFooter } from './ModalFrame';

type FormMode = 'closed' | 'create' | 'movement';

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15';

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

const pillClass =
  'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide';

const toLocalInputValue = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num: number) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const fromLocalInputValue = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
};

export default function InventoryModal({ onClose }: InventoryModalProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FormMode>('closed');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [rawForm, setRawForm] = useState<RawMaterialCreate>({
    name: '',
    unit: '',
    minStock: 0,
  });

  const [movementForm, setMovementForm] = useState({
    rawMaterialId: '',
    quantity: 0,
    movementType: 'In' as 'In' | 'Out' | 'Waste',
    date: new Date().toISOString(),
  });

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await InventoryService.getAll();
      setItems(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error cargando inventario: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.length;
  const lowStockCount = useMemo(
    () =>
      items.filter(
        (item) => item.currentQuantity <= (item.rawMaterial?.minStock ?? 0)
      ).length,
    [items]
  );
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const visibleItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  const openCreateRaw = () => {
    setRawForm({ name: '', unit: '', minStock: 0 });
    setMode('create');
  };

  const openMovement = (rawMaterialId?: string) => {
    setMovementForm({
      rawMaterialId: rawMaterialId || '',
      quantity: 0,
      movementType: 'In',
      date: new Date().toISOString(),
    });
    setMode('movement');
  };

  const closeForm = () => {
    setMode('closed');
  };

  const handleCreateRaw = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const ok = await InventoryService.createRawMaterial(rawForm);
      if (ok) {
        toast.success('Materia prima creada');
        closeForm();
        await refresh();
      } else {
        toast.error('No se pudo crear la materia prima');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al guardar: ${message}`);
    }
  };

  const handleRegisterMovement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!movementForm.rawMaterialId) {
      toast.error('Selecciona una materia prima');
      return;
    }
    try {
      const ok = await InventoryService.registerMovement(
        movementForm.rawMaterialId,
        {
          quantity: movementForm.quantity,
          movementType: movementForm.movementType,
          date: movementForm.date,
        }
      );
      if (ok) {
        toast.success('Movimiento registrado');
        closeForm();
        await refresh();
      } else {
        toast.error('No se pudo registrar el movimiento');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al registrar: ${message}`);
    }
  };

  return (
    <>
      <ModalFrame
        title="Inventario"
        description="Supervisa las materias primas disponibles y registra movimientos."
        onClose={onClose}
        width="xl"
        actions={
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
              {lowStockCount} con stock bajo
            </span>
            <button
              type="button"
              onClick={() => openMovement()}
              className={secondaryButtonClass}
            >
              Registrar movimiento
            </button>
            <button
              type="button"
              onClick={openCreateRaw}
              className={primaryButtonClass}
            >
              Nueva materia prima
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-500">
            Cargando inventario...
          </div>
        ) : totalItems === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Aun no hay materias primas registradas.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Materias primas
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {totalItems}
                </p>
                <p className="text-sm text-slate-500">
                  Total de insumos registrados
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock bajo
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-600">
                  {lowStockCount}
                </p>
                <p className="text-sm text-slate-500">
                  Materias primas por debajo del minimo
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Disponibilidad media
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {(
                    items.reduce((sum, item) => sum + item.currentQuantity, 0) /
                    Math.max(1, items.length)
                  ).toFixed(0)}
                </p>
                <p className="text-sm text-slate-500">
                  Promedio de unidades por materia prima
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Materia prima
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Unidad</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Stock minimo
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Cantidad actual
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {visibleItems.map((item) => {
                    const minStock = item.rawMaterial?.minStock ?? 0;
                    const isLow = item.currentQuantity <= minStock;
                    return (
                      <tr
                        key={item.id ?? item.rawMaterialId}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {item.rawMaterial?.name || 'Sin nombre'}
                        </td>
                        <td className="px-4 py-3">
                          {item.rawMaterial?.unit || 'Sin unidad'}
                        </td>
                        <td className="px-4 py-3">{minStock}</td>
                        <td className="px-4 py-3">{item.currentQuantity}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`${pillClass} ${
                              isLow
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isLow ? 'Stock bajo' : 'Saludable'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openMovement(item.rawMaterialId)}
                              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                            >
                              Registrar movimiento
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Pagina {page} de {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className={`${secondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className={`${secondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalFrame>

      {mode === 'create' && (
        <ModalFrame
          title="Nueva materia prima"
          description="Registra un insumo base para el control de ajustes y produccion."
          onClose={closeForm}
          width="md"
        >
          <form className="space-y-5" onSubmit={handleCreateRaw}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nombre
                </label>
                <input
                  value={rawForm.name}
                  onChange={(event) =>
                    setRawForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Unidad
                </label>
                <input
                  value={rawForm.unit}
                  onChange={(event) =>
                    setRawForm((prev) => ({ ...prev, unit: event.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Kg, Lt, unidad..."
                  required
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock minimo
                </label>
                <input
                  type="number"
                  value={rawForm.minStock}
                  onChange={(event) =>
                    setRawForm((prev) => ({
                      ...prev,
                      minStock: Number(event.target.value),
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  min={0}
                  required
                />
              </div>
            </div>

            <ModalFooter>
              <span>El minimo ayuda a detectar alertas de reposicion.</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className={secondaryButtonClass}
                >
                  Cancelar
                </button>
                <button type="submit" className={primaryButtonClass}>
                  Crear materia prima
                </button>
              </div>
            </ModalFooter>
          </form>
        </ModalFrame>
      )}

      {mode === 'movement' && (
        <ModalFrame
          title="Registrar movimiento"
          description="Ajusta el inventario para reflejar recepciones, salidas o merma."
          onClose={closeForm}
          width="md"
        >
          <form className="space-y-5" onSubmit={handleRegisterMovement}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Materia prima
                </label>
                <select
                  value={movementForm.rawMaterialId}
                  onChange={(event) =>
                    setMovementForm((prev) => ({
                      ...prev,
                      rawMaterialId: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                >
                  <option value="">Selecciona una opcion</option>
                  {items.map((item) => (
                    <option key={item.rawMaterialId} value={item.rawMaterialId}>
                      {item.rawMaterial?.name} ({item.rawMaterial?.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Cantidad
                </label>
                <input
                  type="number"
                  value={movementForm.quantity}
                  onChange={(event) =>
                    setMovementForm((prev) => ({
                      ...prev,
                      quantity: Number(event.target.value),
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tipo de movimiento
                </label>
                <select
                  value={movementForm.movementType}
                  onChange={(event) =>
                    setMovementForm((prev) => ({
                      ...prev,
                      movementType: event.target.value as 'In' | 'Out' | 'Waste',
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="In">Entrada</option>
                  <option value="Out">Salida</option>
                  <option value="Waste">Merma</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Fecha
                </label>
                <input
                  type="datetime-local"
                  value={toLocalInputValue(movementForm.date)}
                  onChange={(event) =>
                    setMovementForm((prev) => ({
                      ...prev,
                      date: fromLocalInputValue(event.target.value),
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <ModalFooter>
              <span>
                Las entradas suman stock, las salidas lo disminuyen y la merma
                registra desperdicio.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className={secondaryButtonClass}
                >
                  Cancelar
                </button>
                <button type="submit" className={primaryButtonClass}>
                  Guardar movimiento
                </button>
              </div>
            </ModalFooter>
          </form>
        </ModalFrame>
      )}
    </>
  );
}
