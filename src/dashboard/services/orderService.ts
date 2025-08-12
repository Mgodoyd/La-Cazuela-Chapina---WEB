import { ApiService } from '../../store/api/apiService';

export interface DashboardOrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export interface DashboardOrder {
  id: string;
  status: string;
  userId: string;
  confirmed: boolean;
  items: DashboardOrderItem[];
  createdAt: string;
}

export interface DashboardOrderResponse {
  status: string;
  data: DashboardOrder[];
}

export class DashboardOrderService {
  static async getOrders(): Promise<DashboardOrder[]> {
    const response: DashboardOrderResponse = await ApiService.get('/order', true);
    if (response.status !== 'ok' || !Array.isArray(response.data)) return [];
    return response.data.map((o: any) => ({
      id: o.id || o.Id,
      status: o.status || o.Status,
      userId: o.userId || o.UserId || o.user?.id,
      confirmed: o.confirmed ?? o.Confirmed ?? false,
      items: (o.items || o.Items || []).map((i: any) => ({
        productId: i.productId || i.ProductId,
        productName: i.product?.name || i.Product?.Name || i.productName || i.ProductName,
        quantity: Number(i.quantity ?? i.Quantity ?? 0),
        unitPrice: Number(i.unitPrice ?? i.UnitPrice ?? 0),
      })),
      createdAt: o.createdAt || o.CreatedAt || o.date || o.Date,
    }));
  }

  static async updateOrder(id: string, body: Partial<DashboardOrder>): Promise<boolean> {
    // Enviar todo el objeto (normalizado), aunque el backend solo use status
    const res = await ApiService.put(`/order/${id}`, body, true);
    return res?.status === 'ok';
  }
}


