export interface OrderItem {
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
  }
  
  export interface Order {
    id: string;
    status: string;
    userId: string;
    confirmed: boolean;
    items: OrderItem[];
    createdAt: string;
  }
  
  export interface OrderResponse {
    status: string;
    data: Order[];
  }

  export interface CreateOrderRequest {
    userId: string;
    confirmed: boolean;
    items: OrderItem[];
  }

  export interface OrderStatusProps {
    onClose: () => void;
  }
  