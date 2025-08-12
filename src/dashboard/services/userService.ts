import { ApiService } from '../../global/api/apiService';
import type { DashboardUser, DashboardUserResponse } from '../types/user';

export class UserService {
  static async getUsers(): Promise<DashboardUser[]> {
    try {
      const response: DashboardUserResponse = await ApiService.get(
        '/user',
        true
      );
      if (response.status === 'ok' && Array.isArray(response.data)) {
        return response.data.map((u: any) => ({
          id: u.id || u.Id || '',
          name: u.name || u.Name || '',
          email: u.email || u.Email || '',
          role: u.role || u.Role || '',
        }));
      }
    } catch (_) {
      console.error('Error al obtener usuarios:', _);
    }
    const fallback: DashboardUserResponse = await ApiService.get(
      '/users',
      true
    );
    if (fallback.status !== 'ok' || !Array.isArray(fallback.data)) return [];
    return fallback.data.map((u: any) => ({
      id: u.id || u.Id || '',
      name: u.name || u.Name || '',
      email: u.email || u.Email || '',
      role: u.role || u.Role || '',
    }));
  }

  static async createUser(
    user: Pick<DashboardUser, 'name' | 'email' | 'role'> & { password?: string }
  ): Promise<boolean> {
    const body = user;
    const response = await ApiService.post('/user/register', body, true);
    return response?.status === 'ok';
  }

  static async updateUser(
    id: string,
    user: Partial<Pick<DashboardUser, 'name' | 'email' | 'role'>>
  ): Promise<boolean> {
    const response = await ApiService.put(`/user/${id}`, user, true);
    return response?.status === 'ok';
  }

  static async deleteUser(id: string): Promise<boolean> {
    const response = await ApiService.delete(`/user/${id}`, true);
    return response?.status === 'ok';
  }
}
