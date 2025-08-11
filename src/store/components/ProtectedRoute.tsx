import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectIsAuthenticated, selectRole } from "../store/authSlice";

export default function ProtectedRoute({ children, allow }: { children: React.ReactElement; allow: (role: string | null) => boolean }) {
  const isAuth = useAppSelector((s) => selectIsAuthenticated(s as any));
  const role = useAppSelector((s) => selectRole(s as any));
  if (!isAuth) return <Navigate to="/login-venta" replace />;
  if (!allow(role)) return <Navigate to="/" replace />;
  return children;
} 