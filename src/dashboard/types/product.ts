export interface DashboardProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  stock: number;
  createdAt: string;
}

export interface DashboardProductResponse {
  status: string;
  data: DashboardProduct[];
}


