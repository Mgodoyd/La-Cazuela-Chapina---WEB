import { ApiService } from '../../store/api/apiService';

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  active?: boolean;
  createdAt?: string;
}
export interface SupplierResponse { status: string; data: any[]; }

export class SupplierService {
  static async getAll(): Promise<Supplier[]> {
    const res: SupplierResponse = await ApiService.get('/supplier', true);
    if (res.status !== 'ok' || !Array.isArray(res.data)) return [];
    // Normaliza claves del backend: Id, Name, Contact, Phone → camelCase
    return res.data.map((s: any) => ({
      id: s.id || s.Id,
      name: s.name || s.Name,
      contact: s.contact || s.Contact,
      phone: s.phone || s.Phone,
      address: s.address || s.Address,
      active: s.active ?? s.Active ?? true,
      createdAt: s.createdAt || s.CreatedAt,
    }));
  }
  static async create(s: Omit<Supplier,'id'|'createdAt'>): Promise<boolean> {
    const res = await ApiService.post('/supplier', s, true);
    return res?.status === 'ok';
  }
  static async update(id: string, s: Partial<Omit<Supplier,'id'|'createdAt'>>): Promise<boolean> {
    const res = await ApiService.put(`/supplier/${id}`, s, true);
    return res?.status === 'ok';
  }
  static async delete(id: string): Promise<boolean> {
    const res = await ApiService.delete(`/supplier/${id}`, true);
    return res?.status === 'ok';
  }
}


