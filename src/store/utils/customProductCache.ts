/**
 * Servicio para cachear información de productos customizables
 * Esto ayuda a resolver nombres de productos cuando se muestran las órdenes
 */
import type { CustomProductInfo } from '../types/customProducts';


export class CustomProductCache {
  private static readonly CACHE_KEY = 'customProductsCache';
  private static readonly MAX_CACHE_SIZE = 1000; // Límite de productos en caché
  private static readonly CACHE_EXPIRY_DAYS = 30; // Días antes de que expire el caché

  /**
   * Agregar un producto customizado al caché
   */
  static addProduct(product: Omit<CustomProductInfo, 'createdAt'>): void {
    try {
      const cache = this.getCache();
      const productInfo: CustomProductInfo = {
        ...product,
        createdAt: new Date().toISOString()
      };
      
      cache[product.id] = productInfo;
      
      this.cleanupCache(cache);
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Error al agregar producto al caché:', error);
    }
  }

  /**
   * Obtener información de un producto del caché
   */
  static getProduct(productId: string): CustomProductInfo | null {
    try {
      const cache = this.getCache();
      const product = cache[productId];
      
      if (!product) {
        return null;
      }
      
      // Verificar si el producto ha expirado
      const createdAt = new Date(product.createdAt);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - this.CACHE_EXPIRY_DAYS);
      
      if (createdAt < expiryDate) {
        // Producto expirado, eliminarlo del caché
        delete cache[productId];
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        return null;
      }
      
      return product;
    } catch (error) {
      console.error('Error al obtener producto del caché:', error);
      return null;
    }
  }

  /**
   * Obtener todo el caché
   */
  private static getCache(): Record<string, CustomProductInfo> {
    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY);
      return cacheData ? JSON.parse(cacheData) : {};
    } catch (error) {
      console.error('Error al leer caché:', error);
      return {};
    }
  }

  /**
   * Limpiar productos expirados y mantener el límite de tamaño
   */
  private static cleanupCache(cache: Record<string, CustomProductInfo>): void {
    const products = Object.entries(cache);
    
    // Filtrar productos expirados
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - this.CACHE_EXPIRY_DAYS);
    
    const validProducts = products.filter(([_, product]) => {
      const createdAt = new Date(product.createdAt);
      return createdAt >= expiryDate;
    });
    
    // Si aún excede el límite, eliminar los más antiguos
    if (validProducts.length > this.MAX_CACHE_SIZE) {
      validProducts.sort((a, b) => new Date(b[1].createdAt).getTime() - new Date(a[1].createdAt).getTime());
      validProducts.splice(this.MAX_CACHE_SIZE);
    }
    
    // Reconstruir caché
    const newCache: Record<string, CustomProductInfo> = {};
    validProducts.forEach(([id, product]) => {
      newCache[id] = product;
    });
    
    // Limpiar productos eliminados del caché original
    Object.keys(cache).forEach(id => {
      if (!newCache[id]) {
        delete cache[id];
      }
    });
  }

  /**
   * Limpiar todo el caché (útil para debugging o reset)
   */
  static clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('🧹 Caché de productos customizables limpiado');
    } catch (error) {
      console.error('Error al limpiar caché:', error);
    }
  }

  /**
   * Obtener estadísticas del caché
   */
  static getCacheStats(): { totalProducts: number; tamalCount: number; beverageCount: number } {
    try {
      const cache = this.getCache();
      const products = Object.values(cache);
      
      return {
        totalProducts: products.length,
        tamalCount: products.filter(p => p.type === 'tamal').length,
        beverageCount: products.filter(p => p.type === 'beverage').length
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del caché:', error);
      return { totalProducts: 0, tamalCount: 0, beverageCount: 0 };
    }
  }
}
