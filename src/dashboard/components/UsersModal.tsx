import { useEffect, useMemo, useState } from 'react';
import { UserService } from '../services/userService';
import type { DashboardUser } from '../types/user';
import toast from 'react-hot-toast';
import { confirmToast } from '../utils/confirmToast';
import type { UsersModalProps } from '../types/modals';
import { ModalFrame, ModalFooter } from './ModalFrame';

type FormMode = 'closed' | 'create' | 'edit';

const emptyForm = {
  id: '',
  name: '',
  email: '',
  role: 'Customer',
  password: '',
};

const primaryButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15';

const ghostButtonClass =
  'inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10';

const destructiveButtonClass =
  'inline-flex items-center justify-center rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20';

const subtleTagClass =
  'inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600';

export default function UsersModal({ onClose }: UsersModalProps) {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FormMode>('closed');
  const [form, setForm] = useState({ ...emptyForm });
  const [page, setPage] = useState(1);
  const pageSize = 7;

  useEffect(() => {
    void refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await UserService.getUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = users.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  const visibleUsers = useMemo(
    () => users.slice((page - 1) * pageSize, page * pageSize),
    [users, page]
  );

  const openCreate = () => {
    setForm({ ...emptyForm });
    setMode('create');
  };

  const openEdit = (user: DashboardUser) => {
    setForm({
      id: user.id ?? '',
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    setMode('edit');
  };

  const closeForm = () => {
    setMode('closed');
    setForm({ ...emptyForm });
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const okConfirm = await confirmToast(
      'Eliminar este usuario? Esta accion no se puede deshacer.'
    );
    if (!okConfirm) return;
    try {
      const ok = await UserService.deleteUser(id);
      if (ok) {
        toast.success('Usuario eliminado');
        await refresh();
      } else {
        toast.error('No se pudo eliminar el usuario');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al eliminar: ${message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        const ok = await UserService.createUser({
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password,
        });
        if (ok) {
          toast.success('Usuario creado');
          closeForm();
          await refresh();
        } else {
          toast.error('No se pudo crear el usuario');
        }
      } else if (mode === 'edit' && form.id) {
        const ok = await UserService.updateUser(form.id, {
          name: form.name,
          email: form.email,
          role: form.role,
        });
        if (ok) {
          toast.success('Usuario actualizado');
          closeForm();
          await refresh();
        } else {
          toast.error('No se pudo actualizar el usuario');
        }
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
        title="Usuarios"
        description="Administra los perfiles con acceso al panel y sus permisos."
        onClose={onClose}
        actions={
          <>
            <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
              {totalUsers} usuario{totalUsers === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={openCreate}
              className={primaryButtonClass}
            >
              Nuevo usuario
            </button>
          </>
        }
      >
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
            Cargando usuarios...
          </div>
        ) : totalUsers === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            No hay usuarios registrados por ahora. Crea el primero para
            comenzar.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Rol</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {visibleUsers.map((user) => (
                    <tr
                      key={user.id ?? user.email}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {user.name}
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={subtleTagClass}>{user.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(user)}
                            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            className={destructiveButtonClass}
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
                  className={`${ghostButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className={`${ghostButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
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
          title={mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
          description={
            mode === 'create'
              ? 'Completa los datos del colaborador. Enviarás las credenciales manualmente.'
              : 'Actualiza la informacion visible en el panel.'
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
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rol
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              {mode === 'create' ? (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contraseña temporal
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    required
                  />
                </div>
              ) : null}
            </div>

            <ModalFooter>
              <span>
                {mode === 'create'
                  ? 'Se enviará un correo de bienvenida manualmente.'
                  : 'Los cambios se reflejarán inmediatamente.'}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className={ghostButtonClass}
                >
                  Cancelar
                </button>
                <button type="submit" className={primaryButtonClass}>
                  {mode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
                </button>
              </div>
            </ModalFooter>
          </form>
        </ModalFrame>
      )}
    </>
  );
}

