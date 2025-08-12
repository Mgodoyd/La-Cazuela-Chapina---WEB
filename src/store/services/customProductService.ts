import { ApiService } from '../../global/api/apiService';
import type {
  CustomTamal,
  CustomBeverage,
  CustomProductRequest,
  CustomProductResponse,
} from '../types/customProducts';

export class CustomProductService {
  // Crear tamal personalizado
  static async createCustomTamal(
    tamalData: CustomProductRequest
  ): Promise<CustomProductResponse> {
    try {
      const response = await ApiService.post('/product/tamal', tamalData, true);
      return response;
    } catch (error) {
      console.error('Error creando tamal personalizado:', error);
      throw new Error('No se pudo crear el tamal personalizado');
    }
  }

  // Crear bebida personalizada
  static async createCustomBeverage(
    beverageData: CustomProductRequest
  ): Promise<CustomProductResponse> {
    try {
      const response = await ApiService.post(
        '/product/beverage',
        beverageData,
        true
      );
      return response;
    } catch (error) {
      console.error('Error creando bebida personalizada:', error);
      throw new Error('No se pudo crear la bebida personalizada');
    }
  }

  // Obtener tamales personalizados del usuario
  static async getUserCustomTamales(): Promise<CustomTamal[]> {
    try {
      const response = await ApiService.get('/product/tamal', true);
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo tamales personalizados:', error);
      throw new Error('No se pudieron obtener los tamales personalizados');
    }
  }

  // Obtener bebidas personalizadas del usuario
  static async getUserCustomBeverages(): Promise<CustomBeverage[]> {
    try {
      const response = await ApiService.get('/product/beverage', true);
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo bebidas personalizadas:', error);
      throw new Error('No se pudieron obtener las bebidas personalizadas');
    }
  }
}
