import { ApiService } from '../../store/api/apiService';
import type { DashboardProduct, DashboardProductResponse } from '../types/product';

export class DashboardProductService {
  static async getProducts(): Promise<DashboardProduct[]> {
    const response: DashboardProductResponse = await ApiService.get('/product', false);
    if (response.status !== 'ok' || !Array.isArray(response.data)) return [];
    // Normalizar por si vienen Id/Name
    return response.data.map((p: any) => ({
      id: p.id || p.Id,
      name: p.name || p.Name,
      description: p.description || p.Description || '',
      price: Number(p.price ?? p.Price ?? 0),
      active: Boolean(p.active ?? true),
      stock: Number(p.stock ?? p.Stock ?? 0),
      createdAt: p.createdAt || p.CreatedAt || ''
    }));
  }

  static async createProduct(p: Omit<DashboardProduct, 'id' | 'createdAt'>): Promise<boolean> {
    const response = await ApiService.post('/product/create', p, true);
    return response?.status === 'ok';
  }

  static async updateProduct(id: string, p: Partial<Omit<DashboardProduct, 'id' | 'createdAt'>>): Promise<boolean> {
    const response = await ApiService.put(`/product/${id}`, p, true);
    return response?.status === 'ok';
  }

  static async deleteProduct(id: string): Promise<boolean> {
    const response = await ApiService.delete(`/product/${id}`, true);
    return response?.status === 'ok';
  }
}


