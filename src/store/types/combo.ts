export interface ComboItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  type: 'tamal' | 'beverage' | 'accessory';
}

export interface ComboDefinition {
  id: string;
  name: string;
  description: string;
  items: ComboItem[];
  totalPrice: number;
  discount: number;
  isSeasonal: boolean;
  season?: string;
  active: boolean;
}

export interface CreateComboRequest {
  name: string;
  description: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  discount: number;
  isSeasonal: boolean;
  season?: string;
}

export interface ComboResponse {
  status: string;
  data: ComboDefinition;
}
