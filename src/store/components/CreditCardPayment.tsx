import React, { useState } from 'react';
import { OrderService } from '../services/orderService';
import toast from 'react-hot-toast';
import type { CreditCardPaymentProps } from '../types/credicard';

export default function CreditCardPayment({ onClose, onSuccess, orderData, totalAmount }: CreditCardPaymentProps) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    switch (field) {
      case 'cardholderName':
        processedValue = value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, '').toUpperCase();
        break;
      case 'cvv':
        processedValue = value.replace(/\D/g, '').slice(0,3);
        break;
      case 'city':
        processedValue = value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]/g, '');
        break;
      case 'zipCode':
        processedValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
        break;
      case 'billingAddress':
        processedValue = value.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\.,#-]/g, '');
        break;
      default:
        processedValue = value;
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').slice(0, 16);
    
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    
    return parts.join(' ').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cardNumber || !formData.cardholderName || !formData.cvv || 
        !formData.expiryMonth || !formData.expiryYear || !formData.billingAddress ||
        !formData.city || !formData.zipCode) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    
    const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
    if (cardNumberDigits.length < 13 || cardNumberDigits.length > 16) {
      toast.error('El número de tarjeta debe tener entre 13 y 16 dígitos');
      return;
    }
    
    if (formData.cvv.length < 3) {
      toast.error('El CVV debe tener 3 dígitos');
      return;
    }
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(formData.expiryYear);
    const expMonth = parseInt(formData.expiryMonth);
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      toast.error('La tarjeta está vencida');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🛒 Datos de orden enviados:', {
        userId: orderData.userId,
        itemsCount: orderData.items.length,
        items: orderData.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName || 'NO NAME',
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });
      const response = await OrderService.createOrder(orderData);
      
      if (response.status === 'ok') {
        const orderId = Array.isArray(response.data) && response.data.length > 0 && response.data[0].id
          ? response.data[0].id
          : 'desconocido';
        // toast.success('¡Pago procesado exitosamente! Orden creada: ' + orderId);
        onSuccess();
      } else {
        toast.error('Error al crear la orden');
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      toast.error('Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">💳 Pago con Tarjeta de Crédito</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
          <h4 className="font-medium text-blue-800 mb-2">📋 Resumen de la Orden</h4>
          <div className="text-sm text-blue-700">
            <p><strong>Total a Pagar:</strong> ${totalAmount.toFixed(2)}</p>
            <p><strong>Productos:</strong> {orderData.items.length} item(s)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de la Tarjeta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información de la Tarjeta</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Tarjeta *
              </label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Titular *
                </label>
                <input
                  type="text"
                  value={formData.cardholderName}
                  onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mes de Expiración *
                </label>
                <select
                  value={formData.expiryMonth}
                  onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Mes</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año de Expiración *
                </label>
                <select
                  value={formData.expiryYear}
                  onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Año</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dirección de Facturación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dirección de Facturación</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                value={formData.billingAddress}
                onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Calle 123, Zona 1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ciudad de Guatemala"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="01001"
                  required
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                `Pagar $${totalAmount.toFixed(2)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
