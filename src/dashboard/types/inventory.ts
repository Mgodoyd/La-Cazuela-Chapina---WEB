export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  minStock: number;
}
export interface InventoryItem {
  id: string;
  rawMaterialId: string;
  rawMaterial: RawMaterial;
  currentQuantity: number;
}
export interface InventoryResponse {
  status: string;
  data: any[];
}
export interface RawMaterialCreate {
  name: string;
  unit: string;
  minStock: number;
}
export interface InventoryMovementBody {
  quantity: number;
  movementType: string;
  date?: string;
}

// Nuevo tipo para movimientos
export interface InventoryMovement {
  id: string;
  rawMaterialId: string;
  rawMaterial: RawMaterial | null;
  quantity: number;
  movementType: 'In' | 'Out' | 'Waste';
  date: string;
}
export interface InventoryMovementResponse {
  status: string;
  data: InventoryMovement;
}
