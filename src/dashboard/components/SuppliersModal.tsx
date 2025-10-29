import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { SupplierService } from '../services/supplierService';
import { confirmToast } from '../utils/confirmToast';
import type { SuppliersModalProps } from '../types/modals';
import type { Supplier } from '../types/supplier';
import { ModalFrame, ModalFooter } from './ModalFrame';

type FormMode = 'closed' | 'create' | 'edit';

const emptyForm: Omit<Supplier, 'id' | 'createdAt'> = {
  name: '',
  contact: '',
  phone: '',
};

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15';

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

const destructiveButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20';

const formatDate = (value?: string | Date) => {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin registro';
  return date.toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function SuppliersModal({ onClose }: SuppliersModalProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FormMode>('closed');
  const [form, setForm] = useState({ ...emptyForm });
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await SupplierService.getAll();
      setSuppliers(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error cargando proveedores: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const totalSuppliers = suppliers.length;
  const totalPages = Math.max(1, Math.ceil(totalSuppliers / pageSize));

  const visibleSuppliers = useMemo(
    () => suppliers.slice((page - 1) * pageSize, page * pageSize),
    [suppliers, page, pageSize]
  );

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditing(null);
    setMode('create');
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      contact: supplier.contact || '',
      phone: supplier.phone || '',
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
      'Eliminar este proveedor? Esta accion no se puede deshacer.'
    );
    if (!okConfirm) return;

    try {
      const ok = await SupplierService.delete(id);
      if (ok) {
        toast.success('Proveedor eliminado');
        await refresh();
      } else {
        toast.error('No se pudo eliminar el proveedor');
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
        ok = await SupplierService.update(editing.id, form);
      } else if (mode === 'create') {
        ok = await SupplierService.create(form);
      }

      if (ok) {
        toast.success(
          mode === 'edit' ? 'Proveedor actualizado' : 'Proveedor creado'
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
        title="Proveedores"
        description="Mantiene a mano la informacion de contacto de tus aliados."
        onClose={onClose}
        width="xl"
        actions={
          <>
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
              {totalSuppliers} proveedor{totalSuppliers === 1 ? '' : 'es'}
            </span>
            <button type="button" onClick={openCreate} className={primaryButtonClass}>
              Nuevo proveedor
            </button>
          </>
        }
      >
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
            Cargando proveedores...
          </div>
        ) : totalSuppliers === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            No se han registrado proveedores por ahora.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold">Contacto</th>
                    <th className="px-4 py-3 text-left font-semibold">Telefono</th>
                    <th className="px-4 py-3 text-left font-semibold">Registrado</th>
                    <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {visibleSuppliers.map((supplier) => (
                    <tr
                      key={supplier.id ?? supplier.name}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {supplier.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {supplier.contact || 'Sin contacto'}
                      </td>
                      <td className="px-4 py-3">{supplier.phone || 'Sin telefono'}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(supplier.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(supplier)}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(supplier.id)}
                            className={destructiveButtonClass}
                            disabled={!supplier.id}
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
          title={mode === 'create' ? 'Nuevo proveedor' : 'Editar proveedor'}
          description={
            mode === 'create'
              ? 'Registra datos de contacto y telefono para facilitar el abastecimiento.'
              : 'Actualiza la informacion de contacto disponible para el equipo.'
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
                  Persona de contacto
                </label>
                <input
                  value={form.contact}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, contact: event.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Nombre y cargo"
                />
              </div>
            </div>

            <ModalFooter>
              <span>
                {mode === 'create'
                  ? 'Puedes agregar notas adicionales en la ficha del proveedor.'
                  : 'Los cambios se reflejaran en todos los modulos de compras.'}
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
                  {mode === 'create' ? 'Crear proveedor' : 'Guardar cambios'}
                </button>
              </div>
            </ModalFooter>
          </form>
        </ModalFrame>
      )}
    </>
  );
}
