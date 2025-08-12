import { useEffect, useState } from 'react';
import { DashboardProductService } from '../services/productService';
import { ApiService } from '../../store/api/apiService';
import type { DashboardProduct } from '../types/product';
import toast from 'react-hot-toast';
import { confirmToast } from '../utils/confirmToast';

interface ProductsModalProps {
  onClose: () => void;
}

export default function ProductsModal({ onClose }: ProductsModalProps) {
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<DashboardProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<DashboardProduct, 'id' | 'createdAt'>>({ name: '', description: '', price: 0, active: true, stock: 0 });
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [ragLoading, setRagLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await DashboardProductService.getProducts();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await DashboardProductService.getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setForm({ name: '', description: '', price: 0, active: true, stock: 0 });
    setCreating(true);
    setEditing(null);
    const modal = document.getElementById('create-product-modal');
    if (modal) modal.classList.remove('hidden');
  };

  const startEdit = (p: DashboardProduct) => {
    setForm({ name: p.name, description: p.description, price: p.price, active: p.active, stock: p.stock });
    setEditing(p);
    // Abrir un modal independiente para edición
    const modal = document.getElementById('edit-product-modal');
    if (modal) modal.classList.remove('hidden');
  };

  const handleDelete = async (id: string) => {
    const okConfirm = await confirmToast('¿Eliminar este producto? Esta acción no se puede deshacer.');
    if (!okConfirm) return;
    try {
      const ok = await DashboardProductService.deleteProduct(id);
      if (ok) { toast.success('Producto eliminado'); refresh(); } else { toast.error('No se pudo eliminar'); }
    } catch (e: any) {
      toast.error(`Error al eliminar: ${e?.message || 'desconocido'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let ok = false;
      if (editing) {
        ok = await DashboardProductService.updateProduct(editing.id, form);
      } else {
        ok = await DashboardProductService.createProduct(form);
      }
      if (ok) {
        toast.success(editing ? 'Producto actualizado' : 'Producto creado');
        setCreating(false);
        setEditing(null);
        const modal = document.getElementById('edit-product-modal');
        if (modal) modal.classList.add('hidden');
        const modalCreate = document.getElementById('create-product-modal');
        if (modalCreate) modalCreate.classList.add('hidden');
        refresh();
      } else {
        toast.error('Operación fallida');
      }
    } catch (e: any) {
      toast.error(`Error al guardar: ${e?.message || 'desconocido'}`);
    }
  };

  const handleRagImport = async () => {
    setRagLoading(true);
    try {
      const res = await ApiService.post('/knowledge/import', { source: 'ProductBase' }, true);
      if (res?.status === 'ok') {
        toast.success('RAG IA iniciado correctamente');
      } else {
        toast.success('RAG IA enviado');
      }
    } catch (e: any) {
      toast.error(`Error al ejecutar RAG IA: ${e?.message || 'desconocido'}`);
      console.error(e);
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-4xl border border-white/20">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Productos</h2>
          <div className="flex items-center gap-3">
            <button onClick={handleRagImport} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold shadow hover:brightness-110">Rag IA</button>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div />
            <button onClick={startCreate} className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700">Nuevo Producto</button>
          </div>
          {loading ? (
            <div className="text-center text-gray-300">Cargando...</div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-300">No hay productos</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-white">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Descripción</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Precio</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Activo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Creado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {products.slice((page-1)*pageSize, page*pageSize).map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-white/80">{p.description}</td>
                      <td className="px-4 py-3">${typeof p.price === 'number' ? p.price.toFixed(2) : Number(p.price || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3">{p.active ? 'Sí' : 'No'}</td>
                      <td className="px-4 py-3">{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button onClick={() => startEdit(p)} className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-900 font-semibold shadow hover:brightness-110">Editar</button>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow hover:brightness-110">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4 text-white/80">
                <span className="text-sm">Página {page} de {Math.max(1, Math.ceil(products.length / pageSize))}</span>
                <div className="space-x-2">
                  <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40">Anterior</button>
                  <button disabled={page>=Math.ceil(products.length/pageSize)} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40">Siguiente</button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Modal de creación independiente */}
      <div id="create-product-modal" className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${creating ? '' : 'hidden'}`}>
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Crear Producto</h2>
            <button onClick={() => { const m = document.getElementById('create-product-modal'); m && m.classList.add('hidden'); setCreating(false); }} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Precio</label>
                <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" rows={3} />
              </div>
              <div>
                <label className="block text-sm mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Activo</label>
                <select value={String(form.active)} onChange={e => setForm(f => ({ ...f, active: e.target.value === 'true' }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20">
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => { const m = document.getElementById('create-product-modal'); m && m.classList.add('hidden'); setCreating(false); }} className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow hover:brightness-110">Crear</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      </div>
      {/* Modal de edición independiente */}
      <div id="edit-product-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Editar Producto</h2>
            <button onClick={() => { const m = document.getElementById('edit-product-modal'); m && m.classList.add('hidden'); setEditing(null); }} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Precio</label>
                <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" rows={3} />
              </div>
              <div>
                <label className="block text-sm mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Activo</label>
                <select value={String(form.active)} onChange={e => setForm(f => ({ ...f, active: e.target.value === 'true' }))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20">
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => { const m = document.getElementById('edit-product-modal'); m && m.classList.add('hidden'); setEditing(null); }} className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-900 font-semibold shadow hover:brightness-110">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {ragLoading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span>Procesando RAG IA, por favor espera...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


