import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../global';
import Login from './components/Login';
import UsersModal from './components/UsersModal';
import ProductsModal from './components/ProductsModal';
import OrdersModal from './components/OrdersModal';
import BranchesModal from './components/BranchesModal';
import SuppliersModal from './components/SuppliersModal';
import InventoryModal from './components/InventoryModal';
import DashboardModal from './components/DashboardModal';
import { logout, clearError } from '../global/authSlice';
import { isTokenExpired } from '../utils/token';
import toast, { Toaster } from 'react-hot-toast';

export default function DashboardApp() {
  const dispatch = useAppDispatch();
  const { token, user, error, success } = useAppSelector((state) => state.auth);

  const [showUsers, setShowUsers] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showBranches, setShowBranches] = useState(false);
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (success) {
      toast.success(success);
      dispatch(clearError());
    }
  }, [dispatch, error, success]);

  useEffect(() => {
    if (!token) return;

    const checkExpiration = () => {
      if (token && isTokenExpired(token, 30)) {
        dispatch(
          logout('Tu sesion ha expirado. Por favor inicia sesion nuevamente.')
        );
      }
    };

    checkExpiration();
    const intervalId = window.setInterval(checkExpiration, 60_000);
    return () => window.clearInterval(intervalId);
  }, [dispatch, token]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Sesion cerrada correctamente.');
  };

  const sessionTimestamp = useMemo(
    () =>
      new Date().toLocaleString('es-ES', {
        dateStyle: 'long',
        timeStyle: 'short',
      }),
    []
  );

  const userInitials = useMemo(() => {
    if (!user?.name) return 'AD';
    const [first = '', second = ''] = user.name.trim().split(' ');
    const initials = `${first.charAt(0)}${second.charAt(0)}`.replace(
      /\s/g,
      ''
    );
    if (initials.length >= 2) return initials.toUpperCase();
    return first.charAt(0).toUpperCase() || 'AD';
  }, [user?.name]);

  const managementActions = [
    {
      key: 'users',
      title: 'Usuarios',
      description: 'Organiza roles y permisos del equipo.',
      badge: 'US',
      badgeClass: 'bg-slate-900 text-white',
      onClick: () => setShowUsers(true),
    },
    {
      key: 'products',
      title: 'Productos',
      description: 'Actualiza catalogos, precios y disponibilidad.',
      badge: 'PR',
      badgeClass: 'bg-blue-900 text-white',
      onClick: () => setShowProducts(true),
    },
    {
      key: 'orders',
      title: 'Pedidos',
      description: 'Supervisa pedidos y tiempos de entrega.',
      badge: 'PD',
      badgeClass: 'bg-emerald-900 text-white',
      onClick: () => setShowOrders(true),
    },
    {
      key: 'inventory',
      title: 'Inventario',
      description: 'Controla existencias y alertas de stock.',
      badge: 'IN',
      badgeClass: 'bg-amber-700 text-white',
      onClick: () => setShowInventory(true),
    },
    {
      key: 'branches',
      title: 'Sucursales',
      description: 'Administra ubicaciones y datos de contacto.',
      badge: 'SC',
      badgeClass: 'bg-slate-800 text-white',
      onClick: () => setShowBranches(true),
    },
    {
      key: 'suppliers',
      title: 'Proveedores',
      description: 'Gestiona acuerdos y cumplimiento.',
      badge: 'PV',
      badgeClass: 'bg-indigo-900 text-white',
      onClick: () => setShowSuppliers(true),
    },
    {
      key: 'dashboard',
      title: 'Dashboard',
      description: 'Consulta indicadores globales y reportes.',
      badge: 'DB',
      badgeClass: 'bg-slate-700 text-white',
      onClick: () => setShowDashboard(true),
    },
  ];

  const agendaItems = [
    {
      key: 'orders',
      title: 'Revisar pedidos pendientes',
      description: 'Confirma estados y tiempos antes del corte diario.',
      action: () => setShowOrders(true),
    },
    {
      key: 'inventory',
      title: 'Auditar inventario',
      description: 'Valida ajustes y proyecciones de demanda.',
      action: () => setShowInventory(true),
    }
  ];

  const insightNotes = [
    'Comparte indicadores clave del dashboard en la reunion matutina.',
    'Establece alertas de stock minimo para los productos criticos.',
    'Registra comentarios de clientes en el modulo de pedidos.',
  ];

  const sessionMetrics = [
    {
      label: 'Rol del perfil',
      value: user?.role ?? 'No asignado',
      helper: 'Control de acceso vigente',
    },
    {
      label: 'Modulos activos',
      value: managementActions.length.toString(),
      helper: 'Usuarios, productos, pedidos y mas',
    },
    {
      label: 'Sesion iniciada',
      value: sessionTimestamp,
      helper: 'Horario local',
    },
  ];

  if (!token || !user) return <Login />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '12px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#0f172a',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Administracion
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              Panel de control
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-600">
              Gestiona operaciones clave desde un entorno limpio, ordenado y sin distracciones.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6">
            <div className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-2 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-semibold text-white">
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sesion activa
                </p>
                <p className="truncate text-lg font-semibold text-slate-900">
                  {user?.name}
                </p>
                <p className="truncate text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
            >
              Cerrar sesion
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {sessionMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {metric.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-slate-600">{metric.helper}</p>
            </div>
          ))}
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Gestion central</h2>
            <p className="mt-1 text-sm text-slate-600">
              Accede a cada modulo sin salir del panel principal.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {managementActions.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className="group flex h-full flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white px-5 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <span
                  className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-3 text-xs font-semibold tracking-wide ${item.badgeClass}`}
                >
                  {item.badge}
                </span>
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.description}
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 transition group-hover:text-slate-700">
                  Abrir modulo{' ->'}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Agenda operativa</h3>
            <p className="mt-1 text-sm text-slate-600">
              Prioridades sugeridas para mantener el flujo diario.
            </p>
            <div className="mt-4 space-y-2">
              {agendaItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.action}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">Abrir</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Notas rapidas</h3>
            <p className="mt-1 text-sm text-slate-600">
              Mantente alineado con los objetivos del equipo.
            </p>
            <ul className="mt-4 space-y-3">
              {insightNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                  <p className="text-sm text-slate-600">{note}</p>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setShowDashboard(true)}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-700 focus:outline-none"
            >
              Revisar dashboard general
              <span aria-hidden="true">{'->'}</span>
            </button>
          </div>
        </section>
      </div>

      {showUsers && <UsersModal onClose={() => setShowUsers(false)} />}
      {showProducts && <ProductsModal onClose={() => setShowProducts(false)} />}
      {showOrders && <OrdersModal onClose={() => setShowOrders(false)} />}
      {showBranches && <BranchesModal onClose={() => setShowBranches(false)} />}
      {showSuppliers && <SuppliersModal onClose={() => setShowSuppliers(false)} />}
      {showInventory && <InventoryModal onClose={() => setShowInventory(false)} />}
      {showDashboard && <DashboardModal onClose={() => setShowDashboard(false)} />}
    </div>
  );
}
