import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { confirmToast } from '../utils/confirmToast';
import { BranchService } from '../services/branchService';
import type { Branch } from '../types/branch';
import type { BranchesModalProps } from '../types/modals';
import { ModalFrame, ModalFooter } from './ModalFrame';

type FormMode = 'closed' | 'create' | 'edit';

const emptyForm = {
  name: '',
  address: '',
  phone: '',
};

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15';

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

const destructiveButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20';

const pillClass =
  'inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide';

const formatDate = (value?: string | Date) => {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin registro';
  return date.toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function BranchesModal({ onClose }: BranchesModalProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FormMode>('closed');
  const [form, setForm] = useState({ ...emptyForm });
  const [editing, setEditing] = useState<Branch | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await BranchService.getAll();
      setBranches(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error cargando sucursales: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalBranches = branches.length;
  const totalPages = Math.max(1, Math.ceil(totalBranches / pageSize));

  const visibleBranches = useMemo(
    () => branches.slice((page - 1) * pageSize, page * pageSize),
    [branches, page, pageSize]
  );

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditing(null);
    setMode('create');
  };

  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setForm({
      name: branch.name || '',
      address: branch.address || '',
      phone: branch.phone || '',
    });
    setMode('edit');
  };

  const closeForm = () => {
    setMode('closed');
    setEditing(null);
    setForm({ ...emptyForm });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const okConfirm = await confirmToast(
      'Eliminar esta sucursal? Esta accion no se puede deshacer.'
    );
    if (!okConfirm) return;

    try {
      const ok = await BranchService.delete(id);
      if (ok) {
        toast.success('Sucursal eliminada');
        await refresh();
      } else {
        toast.error('No se pudo eliminar la sucursal');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al eliminar: ${message}`);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      let ok = false;
      if (mode === 'edit' && editing) {
        ok = await BranchService.update(editing.id, {
          name: form.name,
          address: form.address,
          phone: form.phone,
        });
      } else if (mode === 'create') {
        ok = await BranchService.create({
          name: form.name,
          address: form.address,
          phone: form.phone,
        });
      }

      if (ok) {
        toast.success(
          mode === 'edit' ? 'Sucursal actualizada' : 'Sucursal creada'
        );
        closeForm();
        await refresh();
      } else {
        toast.error('No se pudo completar la operacion');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al guardar: ${message}`);
    }
  };

  return (
    <>
      <ModalFrame
        title="Sucursales"
        description="Consulta y administra los puntos de venta activos."
        onClose={onClose}
        width="xl"
        actions={
          <>
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
              {totalBranches} sucursal{totalBranches === 1 ? '' : 'es'}
            </span>
            <button type="button" onClick={openCreate} className={primaryButtonClass}>
              Nueva sucursal
            </button>
          </>
        }
      >
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
            Cargando sucursales...
          </div>
        ) : totalBranches === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            No se han registrado sucursales por ahora.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold">Direccion</th>
                    <th className="px-4 py-3 text-left font-semibold">Telefono</th>
                    <th className="px-4 py-3 text-left font-semibold">Estado</th>
                    <th className="px-4 py-3 text-left font-semibold">Creacion</th>
                    <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {visibleBranches.map((branch) => (
                    <tr
                      key={branch.id ?? branch.name}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {branch.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {branch.address || 'Sin direccion'}
                      </td>
                      <td className="px-4 py-3">
                        {branch.phone || 'Sin telefono'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`${pillClass} ${
                            branch.active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {branch.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(branch.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(branch)}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(branch.id)}
                            className={destructiveButtonClass}
                            disabled={!branch.id}
                          >
                            Eliminar
                          </button>
                        </div>
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

      {mode !== 'closed' && (
        <ModalFrame
          title={mode === 'create' ? 'Nueva sucursal' : 'Editar sucursal'}
          description={
            mode === 'create'
              ? 'Introduce los datos basicos de la nueva ubicacion.'
              : 'Actualiza la informacion publica de la sucursal.'
          }
          onClose={closeForm}
          width="md"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nombre
                </label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Telefono
                </label>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="(502) 0000-0000"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Direccion
                </label>
                <textarea
                  value={form.address}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, address: event.target.value }))
                  }
                  rows={3}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Zona, referencia y horario"
                />
              </div>
            </div>

            <ModalFooter>
              <span>
                {mode === 'create'
                  ? 'Recuerda completar el mapa en el sistema principal.'
                  : 'Los cambios se reflejaran de inmediato en el dashboard.'}
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
                  {mode === 'create' ? 'Crear sucursal' : 'Guardar cambios'}
                </button>
              </div>
            </ModalFooter>
          </form>
        </ModalFrame>
      )}
    </>
  );
}
