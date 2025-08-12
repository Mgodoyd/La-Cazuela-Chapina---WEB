import { ApiService } from '../../store/api/apiService';

// Estructuras reales de backend
export interface RawMaterial { id: string; name: string; unit: string; minStock: number; }
export interface InventoryItem { id: string; rawMaterialId: string; rawMaterial: RawMaterial; currentQuantity: number; }
export interface InventoryResponse { status: string; data: any[]; }
export interface RawMaterialCreate { name: string; unit: string; minStock: number; }
export interface InventoryMovementBody { quantity: number; movementType: string; date?: string; }

// Nuevo tipo para movimientos
export interface InventoryMovement { 
  id: string; 
  rawMaterialId: string; 
  rawMaterial: RawMaterial | null; 
  quantity: number; 
  movementType: 'In' | 'Out' | 'Waste'; 
  date: string; 
}
export interface InventoryMovementResponse { status: string; data: InventoryMovement; }

export class InventoryService {
  static async getAll(): Promise<InventoryItem[]> {
    const res: InventoryResponse = await ApiService.get('/inventory', true);
    if (res.status !== 'ok' || !Array.isArray(res.data)) return [];
    // Normaliza claves por si vienen con mayúsculas
    return res.data.map((i: any) => ({
      id: i.id || i.Id,
      rawMaterialId: i.rawMaterialId || i.RawMaterialId,
      currentQuantity: Number(i.currentQuantity ?? i.CurrentQuantity ?? 0),
      rawMaterial: {
        id: i.rawMaterial?.id || i.RawMaterial?.Id || i.rawMaterialId || i.RawMaterialId,
        name: i.rawMaterial?.name || i.RawMaterial?.Name || '',
        unit: i.rawMaterial?.unit || i.RawMaterial?.Unit || '',
        minStock: Number(i.rawMaterial?.minStock ?? i.RawMaterial?.MinStock ?? 0),
      },
    }));
  }

  // Nuevo método para obtener movimientos
  static async getMovements(): Promise<InventoryMovement[]> {
    try {
      const res: InventoryResponse = await ApiService.get('/inventory/movements', true);
      if (res.status !== 'ok' || !Array.isArray(res.data)) return [];
      
      // Para cada movimiento, obtener la información de la materia prima
      const movementsWithMaterials = await Promise.all(
        res.data.map(async (movement: any) => {
          let rawMaterial: RawMaterial | null = null;
          
          if (movement.rawMaterialId) {
            try {
              const materialRes = await ApiService.get(`/inventory/${movement.rawMaterialId}`, true);
              if (materialRes.status === 'ok' && materialRes.data) {
                const material = materialRes.data;
                rawMaterial = {
                  id: material.id || material.Id,
                  name: material.name || material.Name,
                  unit: material.unit || material.Unit,
                  minStock: Number(material.minStock ?? material.MinStock ?? 0),
                };
              }
            } catch (error) {
              console.warn(`No se pudo obtener materia prima ${movement.rawMaterialId}:`, error);
            }
          }

          return {
            id: movement.id || movement.Id,
            rawMaterialId: movement.rawMaterialId || movement.RawMaterialId,
            rawMaterial,
            quantity: Number(movement.quantity ?? movement.Quantity ?? 0),
            movementType: movement.movementType || movement.MovementType || 'In',
            date: movement.date || movement.Date || new Date().toISOString(),
          };
        })
      );

      return movementsWithMaterials;
    } catch (error) {
      console.error('Error obteniendo movimientos:', error);
      return [];
    }
  }

  static async createRawMaterial(rawMaterial: RawMaterialCreate): Promise<boolean> {
    const res = await ApiService.post('/inventory/create', rawMaterial, true);
    return res?.status === 'ok';
  }

  static async registerMovement(rawMaterialId: string, movement: InventoryMovementBody): Promise<boolean> {
    const res = await ApiService.post(`/inventory/${rawMaterialId}/movement`, movement, true);
    return res?.status === 'ok';
  }
}


