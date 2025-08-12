import { useEffect, useState } from 'react';
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
  }, [error, success, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('¡Sesión cerrada exitosamente!');
  };

  if (!token || !user) return <Login />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Toaster para notificaciones */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="text-gray-300 mt-2">
                  Control total de tu sistema empresarial
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-gray-400 text-sm">Administrador</p>
                <p className="font-semibold text-white">{user.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:from-red-600 hover:via-pink-600 hover:to-red-700 transition-all duration-200 shadow-2xl hover:shadow-red-500/25 transform hover:-translate-y-0.5"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-8 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-blue-500/30">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-300 mb-3">
                Usuarios
              </h3>
              <p className="text-blue-200 mb-4">
                Gestiona usuarios del sistema
              </p>
              <button
                onClick={() => setShowUsers(true)}
                className="text-blue-300 hover:text-blue-200 font-medium transition duration-200 hover:underline"
              >
                Administrar →
              </button>
            </div>

            <div className="group bg-gradient-to-br from-green-500/20 to-green-600/20 p-8 rounded-2xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-green-500/30">
              <div className="h-16 w-16 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-300 mb-3">
                Productos
              </h3>
              <p className="text-green-200 mb-4">Administra el catálogo</p>
              <button
                onClick={() => setShowProducts(true)}
                className="text-green-300 hover:text-green-200 font-medium transition duration-200 hover:underline"
              >
                Gestionar →
              </button>
            </div>

            <div className="group bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-8 rounded-2xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-purple-500/30">
              <div className="h-16 w-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-purple-300 mb-3">
                Inventario
              </h3>
              <p className="text-purple-200 mb-1">Control de stock</p>
              <button
                onClick={() => setShowInventory(true)}
                className="text-purple-300 hover:text-purple-200 font-medium transition duration-200 hover:underline"
              >
                Inventario →
              </button>
            </div>

            <div className="group bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-8 rounded-2xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-blue-500/30">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-blue-300 mb-3">
                Pedidos
              </h3>
              <p className="text-blue-200 mb-1">Control de pedidos</p>
              <button
                onClick={() => setShowOrders(true)}
                className="text-blue-300 hover:text-blue-200 font-medium transition duration-200 hover:underline"
              >
                Pedidos →
              </button>
            </div>

            <div className="group bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-8 rounded-2xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-orange-500/30">
              <div className="h-16 w-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-orange-300 mb-3">
                Sucursales
              </h3>
              <p className="text-orange-200 mb-1">Gestiona las sucursales</p>
              <button
                onClick={() => setShowBranches(true)}
                className="text-orange-300 hover:text-orange-200 font-medium transition duration-200 hover:underline"
              >
                Sucursales →
              </button>
            </div>

            <div className="group bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-8 rounded-2xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-orange-500/30">
              <div className="h-16 w-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-orange-300 mb-3">
                Proveedores
              </h3>
              <p className="text-orange-200 mb-1">Gestiona los proveedores</p>
              <button
                onClick={() => setShowSuppliers(true)}
                className="text-red-300 hover:text-red-200 font-medium transition duration-200 hover:underline"
              >
                Proveedores →
              </button>
            </div>

            <div className="group bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-8 rounded-2xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-orange-500/30">
              <div className="h-16 w-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-orange-300 mb-3">
                Dashboard
              </h3>
              <p className="text-orange-200 mb-1">Gestiona el dashboard</p>
              <button
                onClick={() => setShowDashboard(true)}
                className="text-orange-300 hover:text-orange-200 font-medium transition duration-200 hover:underline"
              >
                Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>
      {showUsers && <UsersModal onClose={() => setShowUsers(false)} />}
      {showProducts && <ProductsModal onClose={() => setShowProducts(false)} />}
      {showOrders && <OrdersModal onClose={() => setShowOrders(false)} />}
      {showBranches && <BranchesModal onClose={() => setShowBranches(false)} />}
      {showSuppliers && (
        <SuppliersModal onClose={() => setShowSuppliers(false)} />
      )}
      {showInventory && (
        <InventoryModal onClose={() => setShowInventory(false)} />
      )}
      {showDashboard && (
        <DashboardModal onClose={() => setShowDashboard(false)} />
      )}
    </div>
  );
}
