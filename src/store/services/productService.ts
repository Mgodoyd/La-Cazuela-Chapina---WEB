import { ApiService } from '../api/apiService';
import type { Product, ComboProduct } from '../types/product';


export class ProductService {
  // Función para excluir productos personalizados
  private static notPersonalizado(p: Product): boolean {
    const desc = p.Description?.toLowerCase() || '';
    return !desc.includes('personalizado') && !desc.includes('perzonalizado');
  }

  // Identifica bebidas de forma más robusta (por categoría o por palabras clave)
  private static isBebida(p: Product): boolean {
    if (p.category === 'bebida') return true;
    const name = (p.Name || '').toLowerCase();
    const desc = (p.Description || '').toLowerCase();
    const text = `${name} ${desc}`;
    return /\b(atol|atole|shuco|elote|pinol|cacao|batido|bebida)\b/.test(text);
  }

  static async getAllProducts(): Promise<{
    tamales: Product[];
    bebidas: Product[];
    combos: ComboProduct[];
  }> {
    try {
      const response = await ApiService.get('/product', false);

      const tamales = response.data.filter((p: Product) =>
        p.Name.toLowerCase().includes('tamal') &&
        (p.active !== false) &&
        this.notPersonalizado(p)
      );

      const bebidas = response.data.filter((p: Product) =>
        this.isBebida(p) && (p.active !== false) && this.notPersonalizado(p)
      );

      const combos = response.data.filter((p: Product) =>
        p.Name.toLowerCase().includes('combo') &&
        (p.active !== false) &&
        this.notPersonalizado(p)
      ).map((p: Product) => ({
        ...p,
        totalPrice: p.Price
      }));

      return { tamales, bebidas, combos };
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return { tamales: [], bebidas: [], combos: [] };
    }
  }

  static async getTamales(): Promise<Product[]> {
    try {
      const response = await ApiService.get('/product', false);
      return response.data.filter((p: Product) =>
        p.Name.toLowerCase().includes('tamal') &&
        (p.active !== false) &&
        this.notPersonalizado(p)
      ) || [];
    } catch (error) {
      console.error('Error obteniendo tamales:', error);
      return [];
    }
  }

  static async getBebidas(): Promise<Product[]> {
    try {
      const response = await ApiService.get('/product', false);
      return response.data.filter((p: Product) =>
        this.isBebida(p) && (p.active !== false) && this.notPersonalizado(p)
      ) || [];
    } catch (error) {
      console.error('Error obteniendo bebidas:', error);
      return [];
    }
  }

  static async getCombos(): Promise<ComboProduct[]> {
    try {
      const response = await ApiService.get('/product', false);
      return response.data.filter((p: Product) =>
        p.Name.toLowerCase().includes('combo') &&
        (p.active !== false) &&
        this.notPersonalizado(p)
      ).map((p: Product) => ({
        ...p,
        totalPrice: p.Price
      })) || [];
    } catch (error) {
      console.error('Error obteniendo combos:', error); 
      return [];
    }
  }

  static async getAvailableProducts(): Promise<{
    tamales: Product[];
    bebidas: Product[];
    combos: ComboProduct[];
  }> {
    try {
      const response = await ApiService.get('/product', false);
      const { tamales, bebidas, combos } = response.data;

      return {
        tamales: tamales?.filter((p: any) => p.available && this.notPersonalizado(p)) || [],
        bebidas: bebidas?.filter((p: any) => p.available && this.notPersonalizado(p)) || [],
        combos: combos?.filter((p: any) => p.available && this.notPersonalizado(p)) || []
      };
    } catch (error) {
      console.error('Error obteniendo productos disponibles:', error);
      return {
        tamales: [],
        bebidas: [],
        combos: []
      };
    }
  }
}
