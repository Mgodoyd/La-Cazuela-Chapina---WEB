import { useEffect, useState } from 'react';
import { UserService } from '../services/userService';
import type { DashboardUser } from '../types/user';
import toast from 'react-hot-toast';
import { confirmToast } from '../utils/confirmToast';
import type { UsersModalProps } from '../types/modals';

export default function UsersModal({ onClose }: UsersModalProps) {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{
    id?: string;
    name: string;
    email: string;
    role: string;
    password?: string;
  }>({ name: '', email: '', role: 'Customer', password: '' });
  const [page, setPage] = useState(1);
  const pageSize = 7;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await UserService.getUsers();
        setUsers(data);
      } finally {
        setLoading(false);
      }
    };
    load();
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

  const handleDelete = async (id: string) => {
    const okConfirm = await confirmToast(
      '¿Eliminar este usuario? Esta acción no se puede deshacer.'
    );
    if (!okConfirm) return;
    try {
      const ok = await UserService.deleteUser(id);
      if (ok) {
        toast.success('Usuario eliminado');
        refresh();
      } else {
        toast.error('No se pudo eliminar');
      }
    } catch (e: any) {
      toast.error(`Error al eliminar: ${e?.message || 'desconocido'}`);
    }
  };

  const handleEdit = (u: DashboardUser) => {
    setForm({ id: u.id, name: u.name, email: u.email, role: u.role });
    setCreating(true);
    const modal = document.getElementById('edit-user-modal');
    if (modal) modal.classList.remove('hidden');
  };

  const handleCreate = () => {
    setForm({ name: '', email: '', role: 'Customer', password: '' });
    setCreating(true);
    const modal = document.getElementById('create-user-modal');
    if (modal) modal.classList.remove('hidden');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let ok = false;
      if (form.id) {
        ok = await UserService.updateUser(form.id, {
          name: form.name,
          email: form.email,
          role: form.role,
        });
      } else {
        ok = await UserService.createUser({
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password,
        });
      }
      if (ok) {
        toast.success(form.id ? 'Usuario actualizado' : 'Usuario creado');
        setCreating(false);
        const editM = document.getElementById('edit-user-modal');
        if (editM) editM.classList.add('hidden');
        const createM = document.getElementById('create-user-modal');
        if (createM) createM.classList.add('hidden');
        await refresh();
      } else {
        toast.error('Operación fallida');
      }
    } catch (e: any) {
      toast.error(`Error al guardar: ${e?.message || 'desconocido'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-3xl border border-white/20">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Usuarios</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div />
            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold shadow hover:brightness-110"
            >
              Nuevo Usuario
            </button>
          </div>
          {loading ? (
            <div className="text-center text-gray-300">Cargando...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-300">No hay usuarios</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-white">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((u, idx) => (
                      <tr key={u.id || idx} className="hover:bg-white/5">
                        <td className="px-4 py-3">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">{u.role}</td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-900 font-semibold shadow hover:brightness-110"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="px-3 py-1 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow hover:brightness-110"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4 text-white/80">
                <span className="text-sm">
                  Página {page} de{' '}
                  {Math.max(1, Math.ceil(users.length / pageSize))}
                </span>
                <div className="space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <button
                    disabled={page >= Math.ceil(users.length / pageSize)}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Modales independientes para crear y editar */}
        <div
          id="create-user-modal"
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${creating && !form.id ? '' : 'hidden'}`}
        >
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Crear Usuario</h2>
              <button
                onClick={() => {
                  const m = document.getElementById('create-user-modal');
                  m && m.classList.add('hidden');
                  setCreating(false);
                }}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white"
              >
                <div>
                  <label className="block text-sm mb-1">Nombre</label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Rol</label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const m = document.getElementById('create-user-modal');
                      m && m.classList.add('hidden');
                      setCreating(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow hover:brightness-110"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div
          id="edit-user-modal"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden"
        >
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Editar Usuario</h2>
              <button
                onClick={() => {
                  const m = document.getElementById('edit-user-modal');
                  m && m.classList.add('hidden');
                  setCreating(false);
                  setForm({
                    name: '',
                    email: '',
                    role: 'Customer',
                    password: '',
                  });
                }}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white"
              >
                <div>
                  <label className="block text-sm mb-1">Nombre</label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Rol</label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const m = document.getElementById('edit-user-modal');
                      m && m.classList.add('hidden');
                      setCreating(false);
                      setForm({
                        name: '',
                        email: '',
                        role: 'Customer',
                        password: '',
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-900 font-semibold shadow hover:brightness-110"
                  >
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
