import { ApiService } from '../../global/api/apiService';
import type { Branch, BranchResponse } from '../types/branch';

export class BranchService {
  static async getAll(): Promise<Branch[]> {
    const res: BranchResponse = await ApiService.get('/branch', true);
    if (res.status !== 'ok' || !Array.isArray(res.data)) return [];
    return res.data.map((b: any) => ({
      id: b.id || b.Id,
      name: b.name || b.Name,
      address: b.address || b.Address,
      phone: b.phone || b.Phone,
      active: b.active ?? b.Active ?? true,
      createdAt: b.createdAt || b.CreatedAt,
    }));
  }
  static async create(branch: {
    name: string;
    address?: string;
    phone?: string;
  }): Promise<boolean> {
    const res = await ApiService.post('/branch/create', branch, true);
    return res?.status === 'ok';
  }
  static async update(
    id: string,
    branch: { name?: string; address?: string; phone?: string }
  ): Promise<boolean> {
    const res = await ApiService.put(`/branch/${id}`, branch, true);
    return res?.status === 'ok';
  }
  static async delete(id: string): Promise<boolean> {
    const res = await ApiService.delete(`/branch/${id}`, true);
    return res?.status === 'ok';
  }
}
