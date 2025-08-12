export interface CustomTamal {
  name?: string;
  description?: string;
  price: number;
  active: boolean;
  stock?: number;
  doughType: 'amarillo' | 'negro' | 'blanco' | 'rojo';
  filling: 'cerdo' | 'pollo' | 'res' | 'vegetariano' | 'queso';
  wrapper: 'plátano' | 'hoja' | 'maíz';
  spiceLevel: 'suave' | 'medio' | 'picante';
  quantity: 1 | 6 | 12;
}

export interface CustomBeverage {
  name?: string;
  description?: string;
  price: number;
  active: boolean;
  stock?: number;
  type: 'atole' | 'agua' | 'jugo' | 'café';
  sweetener: 'panela' | 'azúcar' | 'miel' | 'sin endulzar';
  topping: 'canela' | 'chocolate' | 'frutas' | 'crema' | 'ninguno';
  size: '12oz' | '1L';
}

export interface CustomProductResponse {
  status: string;
  data: CustomTamal | CustomBeverage;
}

export interface CustomProductRequest {
  name?: string;
  description?: string;
  price: number;
  active: boolean;
  stock?: number;
  // Tamal específico
  doughType?: 'amarillo' | 'negro' | 'blanco' | 'rojo';
  filling?: 'cerdo' | 'pollo' | 'res' | 'vegetariano' | 'queso';
  wrapper?: 'plátano' | 'hoja' | 'maíz';
  spiceLevel?: 'suave' | 'medio' | 'picante';
  quantity?: 1 | 6 | 12;
  // Bebida específica
  type?: 'atole' | 'agua' | 'jugo' | 'café';
  sweetener?: 'panela' | 'azúcar' | 'miel' | 'sin endulzar';
  topping?: 'canela' | 'chocolate' | 'frutas' | 'crema' | 'ninguno';
  size?: '12oz' | '1L';
}

export interface CustomProductInfo {
  id: string;
  name: string;
  description?: string;
  type: 'tamal' | 'beverage';
  createdAt: string;
}
