import { ApiService } from '../../global/api/apiService';
import type {
  DashboardSale,
  DashboardSaleResponse,
} from '../types/dashboardSaleItem';

export class SaleService {
  static async getSales(): Promise<DashboardSale[]> {
    const response: DashboardSaleResponse = await ApiService.get('/sale', true);
    if (response.status !== 'ok' || !Array.isArray(response.data)) return [];
    return response.data.map((s: any) => ({
      id: s.id || s.Id,
      userId: s.user?.id || s.userId || s.UserId,
      date: s.date || s.Date,
      total: Number(s.total ?? s.Total ?? 0),
      items: (s.items || s.Items || []).map((i: any) => ({
        productId: i.productId || i.ProductId,
        productName: i.productName || i.ProductName,
        quantity: Number(i.quantity ?? i.Quantity ?? 0),
        unitPrice: Number(i.unitPrice ?? i.UnitPrice ?? 0),
      })),
    }));
  }
}
