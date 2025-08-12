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
