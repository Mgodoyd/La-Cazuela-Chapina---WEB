export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  active?: boolean;
  createdAt?: string;
}
export interface SupplierResponse {
  status: string;
  data: any[];
}
