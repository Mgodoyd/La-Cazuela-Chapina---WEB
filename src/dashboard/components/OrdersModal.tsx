import { useEffect, useMemo, useState } from 'react';
import { DashboardOrderService } from '../services/orderService';
import toast from 'react-hot-toast';
import type { DashboardOrder } from '../types/dashboardOrder';
import type { OrdersModalProps } from '../types/modals';
import { ModalFrame, ModalFooter } from './ModalFrame';

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15';

const statusPillClass =
  'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide';

const formatTotal = (order: DashboardOrder) => {
  const total =
    order.items?.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    ) ?? 0;
  return total.toLocaleString('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  });
};

export default function OrdersModal({ onClose }: OrdersModalProps) {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<DashboardOrder | null>(null);
  const pageSize = 6;

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await DashboardOrderService.getOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));

  const visibleOrders = useMemo(
    () => orders.slice((page - 1) * pageSize, page * pageSize),
    [orders, page, pageSize]
  );

  const handleStatusChange = (status: string) => {
    setEditing((prev) => (prev ? { ...prev, status } : prev));
  };

  const submitEdit = async () => {
    if (!editing) return;
    try {
      const ok = await DashboardOrderService.updateOrder(editing.id, editing);
      if (ok) {
        toast.success('Pedido actualizado');
        await refresh();
        setEditing(null);
      } else {
        toast.error('No se pudo actualizar');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error(message);
    }
  };

  return (
    <>
      <ModalFrame
        title="Pedidos"
        description="Consulta el estado de las ordenes recientes y realiza ajustes rápidos."
        onClose={onClose}
        width="xl"
      >
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
            Cargando pedidos...
          </div>
        ) : totalOrders === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            No hay pedidos registrados por ahora.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Productos
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {visibleOrders.map((order) => (
                    <tr
                      key={order.id ?? order.createdAt}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {order.id?.slice(0, 10) ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`${statusPillClass} ${
                            order.status === 'Terminada'
                              ? 'bg-emerald-100 text-emerald-700'
                              : order.status === 'En Progreso'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.userId || 'Cliente'}
                      </td>
                      <td className="px-4 py-3">{order.items?.length ?? 0}</td>
                      <td className="px-4 py-3 max-w-[260px] truncate text-slate-600">
                        {order.items
                          ?.map((item) => item.productName || item.productId)
                          .join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatTotal(order)}
                      </td>
                      <td className="px-4 py-3">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString('es-GT', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setEditing(order)}
                          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
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

      {editing && (
        <ModalFrame
          title="Editar pedido"
          description="Actualiza el estado operativo del pedido seleccionado."
          onClose={() => setEditing(null)}
          width="md"
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado del pedido
              </label>
              <select
                value={editing.status}
                onChange={(event) => handleStatusChange(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="Solicitada">Solicitada</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Terminada">Terminada</option>
              </select>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Solo se permite modificar el estado del pedido. Los detalles del
              cliente y productos permanecen inalterados.
            </div>
          </div>

          <ModalFooter>
            <span>
              Pedido #{editing.id?.slice(0, 10) ?? '-'} -{' '}
              {editing.userId || 'Cliente'}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className={secondaryButtonClass}
              >
                Cancelar
              </button>
              <button type="button" onClick={submitEdit} className={primaryButtonClass}>
                Guardar cambios
              </button>
            </div>
          </ModalFooter>
        </ModalFrame>
      )}
    </>
  );
}
