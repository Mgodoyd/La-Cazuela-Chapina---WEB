import { BrowserRouter, Link, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import Catalogo from "./pages/Catalogo";
import CombosPage from "./pages/Combos";
import InventarioPage from "./pages/Inventario";
import DashboardPage from "./pages/Dashboard";
import AsistentePage from "./pages/Asistente";
import Cart from "./components/Cart";
import LoginAdminPage from "./pages/LoginAdmin";
import LoginVentaPage from "./pages/LoginVenta";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { logout, selectRole, selectUserName } from "./store/authSlice";

function Navbar() {
  const role = useAppSelector(selectRole);
  const name = useAppSelector(selectUserName);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const doLogout = () => {
    dispatch(logout());
    toast.success("Sesión cerrada");
    navigate("/", { replace: true });
  };

  return (
    <nav className="p-4 border-b flex gap-4 items-center justify-between">
      <div className="flex gap-4">
        <Link to="/catalogo">Catálogo</Link>
        {role && <Link to="/combos">Combos</Link>}
        {role === "admin" && <Link to="/inventario">Inventario</Link>}
        {role === "admin" && <Link to="/dashboard">Dashboard</Link>}
        <Link to="/asistente">Asistente LLM</Link>
      </div>
      <div className="flex gap-3 items-center">
        {!role && (
          <>
            <Link to="/login-admin" className="text-blue-600">Login Admin</Link>
            <Link to="/login-venta" className="text-green-600">Login Venta</Link>
          </>
        )}
        {role && (
          <>
            <span className="text-sm text-gray-600">{name} · {role}</span>
            <button className="text-red-600" onClick={doLogout}>Salir</button>
          </>
        )}
      </div>
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px]">
      <div>{children}</div>
      <Cart />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors />
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/catalogo" replace />} />
        <Route path="/login-admin" element={<LoginAdminPage />} />
        <Route path="/login-venta" element={<LoginVentaPage />} />

        <Route path="/catalogo" element={<Layout><Catalogo /></Layout>} />
        <Route path="/combos" element={
          <ProtectedRoute allow={(r) => !!r}>
            <Layout><CombosPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/inventario" element={
          <ProtectedRoute allow={(r) => r === "admin"}>
            <Layout><InventarioPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute allow={(r) => r === "admin"}>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/asistente" element={<Layout><AsistentePage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
