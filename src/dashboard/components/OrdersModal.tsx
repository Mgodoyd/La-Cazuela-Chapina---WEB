import { useEffect, useState } from 'react';
import { DashboardOrderService } from '../services/orderService';
import type { DashboardOrder } from '../services/orderService';
import toast from 'react-hot-toast';

interface OrdersModalProps { onClose: () => void; }

export default function OrdersModal({ onClose }: OrdersModalProps) {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [editing, setEditing] = useState<DashboardOrder | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await DashboardOrderService.getOrders();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const startEdit = (o: DashboardOrder) => setEditing(o);
  const submitEdit = async () => {
    if (!editing) return;
    try {
      // Enviar el pedido completo; el backend usará el status para la actualización
      const ok = await DashboardOrderService.updateOrder(editing.id, editing);
      if (ok) {
        toast.success('Pedido actualizado');
        // refrescar listado
        const data = await DashboardOrderService.getOrders();
        setOrders(data);
        setEditing(null);
      } else {
        toast.error('No se pudo actualizar');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Error desconocido');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-5xl border border-white/20">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Pedidos</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-300">Cargando...</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-300">No hay pedidos</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-white">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Items</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Productos</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {orders.slice((page-1)*pageSize, page*pageSize).map((o, idx) => (
                    <tr key={o.id || idx} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-mono text-xs">{o.id?.slice(0,8)}...</td>
                      <td className="px-4 py-3">{o.status}</td>
                      <td className="px-4 py-3">{o.userId}</td>
                      <td className="px-4 py-3">{o.items?.length || 0}</td>
                      <td className="px-4 py-3 truncate max-w-[240px]">{(o.items||[]).map(i=>i.productName||i.productId).join(', ')}</td>
                      <td className="px-4 py-3">${(o.items||[]).reduce((s,i)=>s+i.unitPrice*i.quantity,0).toFixed(2)}</td>
                      <td className="px-4 py-3">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>startEdit(o)} className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-900 font-semibold shadow hover:brightness-110">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4 text-white/80">
                <span className="text-sm">Página {page} de {Math.max(1, Math.ceil(orders.length / pageSize))}</span>
                <div className="space-x-2">
                  <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40">Anterior</button>
                  <button disabled={page>=Math.ceil(orders.length/pageSize)} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40">Siguiente</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Editar Pedido</h2>
              <button onClick={()=>setEditing(null)} className="text-white/70 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 text-white space-y-4">
              <div>
                <label className="block text-sm mb-1">Estado</label>
                <select value={editing.status} onChange={e=>setEditing(prev=>prev?{...prev, status: e.target.value}:prev)} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                  <option value="Solicitada">Solicitada</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Terminada">Terminada</option>
                </select>
              </div>
              <div className="text-sm opacity-80">Solo se permite modificar el estado del pedido.</div>
              <div className="flex justify-end gap-2">
                <button onClick={()=>setEditing(null)} className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700">Cancelar</button>
                <button onClick={submitEdit} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow hover:brightness-110">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


