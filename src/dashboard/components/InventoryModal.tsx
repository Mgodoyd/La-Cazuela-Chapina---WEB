import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { InventoryService, type InventoryItem } from '../services/inventoryService';

interface InventoryModalProps { onClose: () => void; }

export default function InventoryModal({ onClose }: InventoryModalProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [_creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  // Formulario para crear materia prima
  const [rawForm, setRawForm] = useState({ name: '', unit: '', minStock: 0 });
  // Ya no se edita InventarioItem directamente (no hay endpoints); solo movimientos
  // Form movimiento para materia prima existente
  const [moveForm, setMoveForm] = useState<{ rawMaterialId: string; quantity: number; movementType: 'In'|'Out'|'Waste'; date: string }>({ rawMaterialId: '', quantity: 0, movementType: 'In', date: new Date().toISOString() });

  const refresh = async () => {
    setLoading(true);
    try { const data = await InventoryService.getAll(); setItems(data); }
    catch (e:any) { toast.error(`Error cargando inventario: ${e?.message||'desconocido'}`); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ refresh(); },[]);

  const startCreate = () => { setRawForm({ name:'', unit:'', minStock:0 }); setCreating(true); setEditing(null); const m=document.getElementById('create-inv-modal'); m&&m.classList.remove('hidden'); };
  // const startEdit = (i: InventoryItem) => { setEditing(i); setMoveForm({ rawMaterialId: i.rawMaterialId, quantity: 0, movementType: 'In', date: new Date().toISOString() }); const m=document.getElementById('movement-modal'); m&&m.classList.remove('hidden'); };
  // const handleDelete = async (_id:string) => { toast.error('Eliminar inventario no está soportado por el backend'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let ok=false;
      if (editing) { ok = false; toast.error('La edición de inventario no está soportada; usa Movimientos.'); }
      else ok = await InventoryService.createRawMaterial(rawForm);
      if (ok) { toast.success('Materia prima creada'); const me=document.getElementById('edit-inv-modal'); me&&me.classList.add('hidden'); const mc=document.getElementById('create-inv-modal'); mc&&mc.classList.add('hidden'); setCreating(false); setEditing(null); refresh(); }
      else toast.error('Operación fallida');
    } catch(e:any){ toast.error(`Error al guardar: ${e?.message||'desconocido'}`);}  
  };

  const submitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ok = await InventoryService.registerMovement(moveForm.rawMaterialId, { quantity: moveForm.quantity, movementType: moveForm.movementType, date: moveForm.date });
      if (ok) { toast.success('Movimiento registrado'); const mm=document.getElementById('movement-modal'); mm&&mm.classList.add('hidden'); refresh(); }
      else toast.error('No se pudo registrar el movimiento');
    } catch (e:any) { toast.error(`Error al registrar: ${e?.message||'desconocido'}`); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-5xl border border-white/20">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Inventario</h2>
          <div className="flex items-center gap-3">
            <button onClick={startCreate} className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold shadow hover:brightness-110">Nueva Materia Prima</button>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-300">Cargando...</div>
          ) : items.length === 0 ? (
            <div className="text-center text-gray-300">No hay registros</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-white">
                <thead className="bg-white/5">
                  <tr>
                     <th className="px-4 py-3 text-left text-sm font-semibold">Materia Prima</th>
                     <th className="px-4 py-3 text-left text-sm font-semibold">Unidad</th>
                     <th className="px-4 py-3 text-left text-sm font-semibold">Stock Mín.</th>
                     <th className="px-4 py-3 text-left text-sm font-semibold">Cantidad Actual</th>
                    {/* <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {items.slice((page-1)*pageSize, page*pageSize).map((i,idx)=>(
                    <tr key={i.id||idx} className="hover:bg-white/5">
                      <td className="px-4 py-3">{i.rawMaterial?.name}</td>
                      <td className="px-4 py-3">{i.rawMaterial?.unit}</td>
                      <td className="px-4 py-3">{i.rawMaterial?.minStock}</td>
                      <td className="px-4 py-3">{i.currentQuantity}</td>
                      <td className="px-4 py-3 space-x-2">
                        {/* <button onClick={()=>startEdit(i)} className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-900 font-semibold shadow hover:brightness-110">Registrar Mov.</button> */}
                        {/* <button onClick={()=>handleDelete(i.id)} className="px-3 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow hover:brightness-110">Eliminar</button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4 text-white/80">
                <span className="text-sm">Página {page} de {Math.max(1, Math.ceil(items.length / pageSize))}</span>
                <div className="space-x-2">
                  <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40">Anterior</button>
                  <button disabled={page>=Math.ceil(items.length/pageSize)} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40">Siguiente</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Crear */}
        <div id="create-inv-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] hidden">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Crear Materia Prima</h2>
              <button onClick={()=>{const m=document.getElementById('create-inv-modal'); m&&m.classList.add('hidden'); setCreating(false);}} className="text-white/70 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                <div>
                  <label className="block text-sm mb-1">Nombre</label>
                  <input value={rawForm.name} onChange={e=>setRawForm(f=>({...f,name:e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Unidad</label>
                  <input value={rawForm.unit} onChange={e=>setRawForm(f=>({...f,unit:e.target.value}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">Stock mínimo</label>
                  <input type="number" value={rawForm.minStock} onChange={e=>setRawForm(f=>({...f,minStock:Number(e.target.value)}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button type="button" onClick={()=>{const m=document.getElementById('create-inv-modal'); m&&m.classList.add('hidden'); setCreating(false);}} className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow hover:brightness-110">Crear</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        
      </div>
      {/* Movimiento */}
      <div id="movement-modal" className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] hidden">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Registrar Movimiento</h2>
            <button onClick={()=>{const m=document.getElementById('movement-modal'); m&&m.classList.add('hidden');}} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
          <div className="p-6">
            <form onSubmit={submitMovement} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Materia Prima</label>
                <select 
                  value={moveForm.rawMaterialId} 
                  onChange={e=>setMoveForm(f=>({...f,rawMaterialId:e.target.value}))} 
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white" 
                  required
                >
                  <option value="">Seleccionar materia prima</option>
                  {items.map(item => (
                    <option key={item.rawMaterialId} value={item.rawMaterialId}>
                      {item.rawMaterial?.name} - {item.rawMaterial?.unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Cantidad</label>
                <input type="number" value={moveForm.quantity} onChange={e=>setMoveForm(f=>({...f,quantity:Number(e.target.value)}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" required />
              </div>
              <div>
                <label className="block text-sm mb-1">Tipo de movimiento</label>
                <select value={moveForm.movementType} onChange={e=>setMoveForm(f=>({...f,movementType:e.target.value as any}))} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20">
                  <option value="In">In</option>
                  <option value="Out">Out</option>
                  <option value="Waste">Waste</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Fecha</label>
                <input type="datetime-local" value={new Date(moveForm.date).toISOString().slice(0,16)} onChange={e=>{
                  // convertir local a ISO UTC aproximado
                  const val = e.target.value; // YYYY-MM-DDTHH:mm
                  const iso = new Date(val).toISOString();
                  setMoveForm(f=>({...f,date: iso}));
                }} className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={()=>{const m=document.getElementById('movement-modal'); m&&m.classList.add('hidden');}} className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-900 font-semibold shadow hover:brightness-110">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


