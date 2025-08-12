import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SupplierService, type Supplier } from '../services/supplierService';
import { confirmToast } from '../utils/confirmToast';

interface SuppliersModalProps { onClose: () => void; }

export default function SuppliersModal({ onClose }: SuppliersModalProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [_creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Omit<Supplier,'id'|'createdAt'>>({ name: '', contact: '', phone: '' });

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await SupplierService.getAll();
      setSuppliers(data);
    } catch (e: any) { toast.error(`Error cargando proveedores: ${e?.message || 'desconocido'}`); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const startCreate = () => {
    setForm({ name: '', contact: '', phone: '' });
    setCreating(true); setEditing(null);
    const m=document.getElementById('create-supplier-modal'); m&&m.classList.remove('hidden');
  };

  const startEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name, contact: s.contact || '', phone: s.phone || '' });
    const m=document.getElementById('edit-supplier-modal'); m&&m.classList.remove('hidden');
  };

  const handleDelete = async (id: string) => {
    const okConfirm = await confirmToast('¿Eliminar este proveedor? Esta acción no se puede deshacer.');
    if (!okConfirm) return;
    try { const ok = await SupplierService.delete(id); if (ok) { toast.success('Proveedor eliminado'); refresh(); } else toast.error('No se pudo eliminar'); }
    catch (e:any) { toast.error(`Error al eliminar: ${e?.message||'desconocido'}`); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let ok=false;
      if (editing) ok=await SupplierService.update(editing.id, form);
      else ok=await SupplierService.create(form);
      if (ok) { toast.success(editing?'Proveedor actualizado':'Proveedor creado'); const me=document.getElementById('edit-supplier-modal'); me&&me.classList.add('hidden'); const mc=document.getElementById('create-supplier-modal'); mc&&mc.classList.add('hidden'); setCreating(false); setEditing(null); refresh(); }
      else toast.error('Operación fallida');
    } catch (e:any) { toast.error(`Error al guardar: ${e?.message||'desconocido'}`); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-5xl border border-white/20">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Proveedores</h2>
          <div className="flex items-center gap-3">
            <button onClick={startCreate} className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold shadow hover:brightness-110">Nuevo Proveedor</button>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-300">Cargando...</div>
          ) : suppliers.length === 0 ? (
            <div className="text-center text-gray-300">No hay proveedores</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-white">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Contacto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Teléfono</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {suppliers.slice((page-1)*pageSize, page*pageSize).map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-white/5">
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3">{s.contact || '-'}</td>
                      <td className="px-4 py-3">{s.phone || '-'}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button onClick={() => startEdit(s)} className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-900 font-semibold shadow hover:brightness-110">Editar</button>
                        <button onClick={() => handleDelete(s.id)} className="px-3 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow hover:brightness-110">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4 text-white/80">
                <span className="text-sm">Página {page} de {Math.max(1, Math.ceil(suppliers.length / pageSize))}</span>
                <div className="space-x-2">
                  <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40">Anterior</button>
                  <button disabled={page>=Math.ceil(suppliers.length/pageSize)} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40">Siguiente</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Crear */}
        <div id="create-supplier-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] hidden">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Crear Proveedor</h2>
              <button onClick={() => { const m=document.getElementById('create-supplier-modal'); m&&m.classList.add('hidden'); setCreating(false); }} className="text-white/70 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <div>
                  <label className="block text-sm mb-1">Nombre</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Contacto</label>
                  <input value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Teléfono</label>
                  <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" />
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => { const m=document.getElementById('create-supplier-modal'); m&&m.classList.add('hidden'); setCreating(false); }} className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow hover:brightness-110">Crear</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Editar */}
        <div id="edit-supplier-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] hidden">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Editar Proveedor</h2>
              <button onClick={() => { const m=document.getElementById('edit-supplier-modal'); m&&m.classList.add('hidden'); setEditing(null); }} className="text-white/70 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <div>
                  <label className="block text-sm mb-1">Nombre</label>
                  <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Contacto</label>
                  <input value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Teléfono</label>
                  <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" />
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => { const m=document.getElementById('edit-supplier-modal'); m&&m.classList.add('hidden'); setEditing(null); }} className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-9 00 font-semibold shadow hover:brightness-110">Actualizar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


