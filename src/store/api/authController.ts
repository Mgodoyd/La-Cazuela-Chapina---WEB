export async function loginController(params: { email: string; password: string; role: "admin" | "venta" }) {
  const { email, password, role } = params;
  // Simulación simple de validación
  const validAdmin = role === "admin" && email.endsWith("@admin.local") && password.length >= 4;
  const validVenta = role === "venta" && email.endsWith("@tienda.local") && password.length >= 4;
  if (!validAdmin && !validVenta) {
    throw new Error("Credenciales inválidas para el rol seleccionado");
  }
  const token = btoa(`${email}:${Date.now()}`);
  const name = email.split("@")[0];
  return { token, name };
}

export function logoutController() {
  // No-op por ahora; si tuviéramos backend, aquí llamaríamos a un endpoint
  return true;
} 