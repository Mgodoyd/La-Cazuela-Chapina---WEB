import { useEffect, useMemo, useState } from 'react';
import { DashboardProductService } from '../services/productService';
import { ApiService } from '../../global/api/apiService';
import type { DashboardProduct } from '../types/product';
import toast from 'react-hot-toast';
import { confirmToast } from '../utils/confirmToast';
import type { ProductsModalProps } from '../types/modals';
import { ModalFrame, ModalFooter } from './ModalFrame';

type FormMode = 'closed' | 'create' | 'edit';

const emptyForm: Omit<DashboardProduct, 'id' | 'createdAt'> = {
  name: '',
  description: '',
  price: 0,
  active: true,
  stock: 0,
};

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15';

const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

const ragButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-sky-500/30';

const deleteButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20';

const pillClass =
  'inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600';

const currency = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
});

const formatDate = (raw?: string) => {
  if (!raw) return 'Sin fecha';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export default function ProductsModal({ onClose }: ProductsModalProps) {
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FormMode>('closed');
  const [form, setForm] =
    useState<Omit<DashboardProduct, 'id' | 'createdAt'>>({ ...emptyForm });
  const [editing, setEditing] = useState<DashboardProduct | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [ragLoading, setRagLoading] = useState(false);

  useEffect(() => {
    void refresh();
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

  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  const visibleProducts = useMemo(
    () => products.slice((page - 1) * pageSize, page * pageSize),
    [products, page, pageSize]
  );

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditing(null);
    setMode('create');
  };

  const openEdit = (product: DashboardProduct) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      active: product.active,
      stock: product.stock,
    });
    setMode('edit');
  };

  const closeForm = () => {
    setMode('closed');
    setEditing(null);
    setForm({ ...emptyForm });
  };

  const handleDelete = async (id: string) => {
    const okConfirm = await confirmToast(
      'Eliminar este producto? Esta accion no se puede deshacer.'
    );
    if (!okConfirm) return;
    try {
      const ok = await DashboardProductService.deleteProduct(id);
      if (ok) {
        toast.success('Producto eliminado');
        await refresh();
      } else {
        toast.error('No se pudo eliminar el producto');
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
        ok = await DashboardProductService.updateProduct(editing.id, form);
      } else if (mode === 'create') {
        ok = await DashboardProductService.createProduct(form);
      }

      if (ok) {
        toast.success(
          mode === 'edit' ? 'Producto actualizado' : 'Producto creado'
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

  const handleRagImport = async () => {
    setRagLoading(true);
    try {
      const res = await ApiService.post(
        '/knowledge/import',
        { source: 'ProductBase' },
        true
      );
      if (res?.status === 'ok') {
        toast.success('RAG IA iniciado correctamente');
      } else {
        toast.success('RAG IA enviado');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al ejecutar RAG IA: ${message}`);
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <>
      <ModalFrame
        title="Productos"
        description="Gestiona el catalogo, precios y disponibilidad en un solo lugar."
        onClose={onClose}
        actions={
          <>
            <button
              type="button"
              onClick={handleRagImport}
              className={ragButtonClass}
            >
              Rag IA
            </button>
            <button
              type="button"
              onClick={openCreate}
              className={primaryButtonClass}
            >
              Nuevo producto
            </button>
          </>
        }
        width="xl"
      >
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-500">
            Cargando productos...
          </div>
        ) : totalProducts === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Aún no tienes productos en el catalogo. Crea uno nuevo para
            comenzar.
          </div>
        ) : (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Descripcion
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Activo
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Creado
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {visibleProducts.map((product) => (
                    <tr
                      key={product.id ?? product.name}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {product.description || 'Sin descripcion'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {currency.format(product.price)}
                      </td>
                      <td className="px-4 py-3">{product.stock}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`${pillClass} ${
                            product.active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {product.active ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatDate(product.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              product.id ? handleDelete(product.id) : null
                            }
                            className={deleteButtonClass}
                            disabled={!product.id}
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
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className={`${secondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={page === totalPages}
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
          title={
            mode === 'create' ? 'Nuevo producto' : 'Editar producto existente'
          }
          description={
            mode === 'create'
              ? 'Completa los detalles del producto para añadirlo al catálogo.'
              : 'Ajusta la información publicada del producto.'
          }
          onClose={closeForm}
          width="lg"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      price: Number(event.target.value),
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Descripcion
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Ingredientes, porcion, notas para el equipo..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Stock
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      stock: Number(event.target.value),
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Estado
                </label>
                <select
                  value={String(form.active)}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      active: event.target.value === 'true',
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="true">Disponible</option>
                  <option value="false">No disponible</option>
                </select>
              </div>
            </div>

            <ModalFooter>
              <span>
                {mode === 'create'
                  ? 'Confirma que los datos estén completos antes de publicar.'
                  : 'Los cambios afectarán de inmediato el catálogo activo.'}
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
                  {mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
                </button>
              </div>
            </ModalFooter>
          </form>
        </ModalFrame>
      )}

      {ragLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-2xl">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            Procesando RAG IA, por favor espera...
          </div>
        </div>
      )}
    </>
  );
}
