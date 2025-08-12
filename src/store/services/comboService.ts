import { ApiService } from '../api/apiService';
import type { ComboDefinition, CreateComboRequest, ComboResponse } from '../types/combo';

export class ComboService {
  // Obtener todos los combos
  static async getAllCombos(): Promise<ComboDefinition[]> {
    try {
      const response = await ApiService.get('/combo', false);
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo combos:', error);
      return [];
    }
  }

  // Crear un nuevo combo
  static async createCombo(comboData: CreateComboRequest): Promise<ComboResponse> {
    try {
      const response = await ApiService.post('/combo/create', comboData, true);
      return response;
    } catch (error) {
      console.error('Error creando combo:', error);
      throw new Error('No se pudo crear el combo');
    }
  }
}