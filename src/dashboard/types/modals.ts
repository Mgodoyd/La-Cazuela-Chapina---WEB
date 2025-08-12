import type { ReactNode } from 'react';

export interface UsersModalProps {
  onClose: () => void;
}
export interface SuppliersModalProps {
  onClose: () => void;
}
export interface ProductsModalProps {
  onClose: () => void;
}
export interface OrdersModalProps {
  onClose: () => void;
}
export interface ProtectedRouteProps {
  children: ReactNode;
}

export interface InventoryModalProps {
  onClose: () => void;
}

export interface DashboardModalProps {
  onClose: () => void;
}

export interface BranchesModalProps {
  onClose: () => void;
}
