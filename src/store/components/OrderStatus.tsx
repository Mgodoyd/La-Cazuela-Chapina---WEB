import { useState, useEffect } from 'react';
import { OrderService } from '../services/orderService';
import { ProductService } from '../services/productService';
import { CustomProductCache } from '../utils/customProductCache';
import type { Order } from '../types/order';
import type { Product } from '../types/product';
import toast from 'react-hot-toast';
import type { OrderStatusProps } from '../types/order';

export default function OrderStatus({ onClose }: OrderStatusProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem('cazuela_user') || '';

  useEffect(() => {
    if (!userId) {
      toast.error('Usuario no identificado. Por favor inicia sesión.');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [userOrders, allProducts] = await Promise.all([
          OrderService.getUserOrders(userId),
          ProductService.getAllProducts(),
        ]);

        // if (userOrders && userOrders.length > 0) {
        //   console.log('orden:', {
        //     id: userOrders[0].id,
        //     itemsCount: userOrders[0].items.length,
        //     firstItem: userOrders[0].items[0] || 'No items'
        //   });
        // }
        setOrders(userOrders);

        const productMap: Record<string, Product> = {};
        allProducts.tamales.forEach((p) => {
          productMap[p.Id] = p;
        });
        allProducts.bebidas.forEach((p) => {
          productMap[p.Id] = p;
        });
        allProducts.combos.forEach((p) => {
          productMap[p.Id] = p;
        });
        setProducts(productMap);
      } catch (error) {
        toast.error('Error al cargar las órdenes o productos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status.toLowerCase()) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'solicitada':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            📋 Estado de Mis Órdenes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Cerrar ventana"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando órdenes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500">No tienes órdenes aún</p>
            <p className="text-sm text-gray-400 mt-2">
              Realiza tu primer pedido para verlo aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Orden #{order.id ? order.id.slice(-8) : 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {order.createdAt
                        ? formatDate(order.createdAt)
                        : 'Fecha no disponible'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status || 'Desconocido'}
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          Producto:{' '}
                          {item.productName ||
                            products[item.productId]?.Name ||
                            CustomProductCache.getProduct(item.productId)
                              ?.name ||
                            `ID: ${item.productId}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${item.unitPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Q{(item.unitPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total de la Orden:
                    </span>
                    <span className="text-2xl font-bold text-orange-600">
                      $
                      {order.items
                        .reduce(
                          (sum, item) => sum + item.unitPrice * item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
