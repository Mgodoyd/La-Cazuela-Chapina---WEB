export interface DashboardSaleItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export interface DashboardSale {
  id: string;
  userId?: string;
  date: string;
  total?: number;
  items: DashboardSaleItem[];
}

export interface DashboardSaleResponse {
  status: string;
  data: DashboardSale[];
}
