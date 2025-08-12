import type { ReactNode } from 'react';
import { useAppSelector } from '../../global';
import Login from './LoginRegister';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, user } = useAppSelector((state) => state.auth);

  if (!token || !user) {
    return <Login />;
  }

  return <>{children}</>;
} 