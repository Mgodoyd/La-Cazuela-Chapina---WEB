import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginController } from "../controllers/authController";
import { useAppDispatch } from "../store/hooks";
import { loginSuccess } from "../store/authSlice";
import { toast } from "sonner";

export default function LoginAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, name } = await loginController({ email, password, role: "admin" });
      dispatch(loginSuccess({ role: "admin", name, token }));
      toast.success("Bienvenido, admin");
      navigate("/dashboard", { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm border rounded p-6 space-y-4 bg-white/50">
        <h1 className="text-xl font-semibold">Ingreso Admin</h1>
        <div>
          <label className="text-sm">Correo (termina en @admin.local)</label>
          <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm">Contraseña</label>
          <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button>
        <p className="text-xs text-gray-500">Usa algo como admin@admin.local / 1234</p>
      </form>
    </div>
  );
} 