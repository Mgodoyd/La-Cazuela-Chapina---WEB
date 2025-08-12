export interface Product {
  Id: string;
  Name: string;
  Description: string;
  Price: number;
  active?: boolean;
  stock?: number;
  createdAt?: string;
  category?: 'tamal' | 'bebida' | 'combo';
  image?: string;
  ingredients?: string[];
  preparationTime?: number;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export interface ComboProduct {
  Id: string;
  Name: string;
  Description: string;
  Price: number;
  active?: boolean;
  stock?: number;
  createdAt?: string;
  products?: Product[];
  discount?: number;
  totalPrice?: number;
}

export interface ProductResponse {
  status: string;
  data: Product[];
}
