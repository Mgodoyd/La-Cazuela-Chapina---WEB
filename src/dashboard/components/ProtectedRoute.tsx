import type { ReactNode } from 'react';
import { useAppSelector } from '../../global';
import Login from './Login';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, user } = useAppSelector((state) => state.auth);

  if (!token || !user) {
    return <Login />;
  }

  // Verificar que el usuario tenga rol de Admin
  if (user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Acceso Denegado
            </h2>
            <p className="text-gray-300 mb-6">
              Solo los administradores pueden acceder al panel de control.
            </p>
            <p className="text-gray-400 text-sm">
              Tu rol actual: <span className="font-semibold text-red-400">{user.role}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
