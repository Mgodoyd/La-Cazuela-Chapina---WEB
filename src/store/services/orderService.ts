import { ApiService } from '../../global/api/apiService';
import type { Order, OrderResponse } from '../types/order';

export class OrderService {
  // Crear una nueva orden
  static async createOrder(orderData: any): Promise<OrderResponse> {
    try {
      const response = await ApiService.post('/order/create', orderData, true);
      return response;
    } catch (error) {
      console.error('Error creando orden:', error);
      return { status: 'error', data: [] };
    }
  }

  // Obtener órdenes del usuario
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const response: OrderResponse = await ApiService.get('/order', true);
      const allOrders = response.data || [];
      // console.log(allOrders);
      // console.log(userId);

      // Filtrar solo las órdenes del usuario actual
      return allOrders.filter(
        (order) =>
          order.userId && order.userId.toLowerCase() === userId.toLowerCase()
      );
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      return [];
    }
  }

  // Obtener orden por ID
  static async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const response = await ApiService.get(`/order/${orderId}`, true);
      return response;
    } catch (error) {
      console.error('Error obteniendo orden:', error);
      return { status: 'error', data: [] };
    }
  }
}
