import React, { useState } from 'react';
import { CustomProductService } from '../services/customProductService';
import type { CustomProductRequest } from '../types/customProducts';
import { CustomProductCache } from '../utils/customProductCache';
import toast from 'react-hot-toast';
import type { CustomBeverageCreatorProps } from '../types/custom';

export default function CustomBeverageCreator({
  onClose,
  onSuccess,
}: CustomBeverageCreatorProps) {
  const [formData, setFormData] = useState<CustomProductRequest>({
    price: 8, // Precio inicial: atole (8) en 12oz = 8
    active: true,
    type: 'atole',
    sweetener: 'panela',
    topping: 'canela',
    size: '12oz',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.price <= 0) {
      toast.error('Por favor ingresa un precio válido');
      return;
    }

    // Generar nombre y descripción automáticamente
    const beverageData = {
      ...formData,
      name: `${formData.type} de ${formData.sweetener} con ${formData.topping}`,
      description: `${formData.type} personalizado con endulzante ${formData.sweetener}, topping ${formData.topping}, tamaño ${formData.size}`,
      stock: 1, // Stock por defecto
    };

    setLoading(true);
    try {
      const response =
        await CustomProductService.createCustomBeverage(beverageData);
      // toast.success('¡Bebida personalizada creada y añadida al carrito!');

      // Añadir al carrito automáticamente
      if (response.data) {
        console.log(
          '🥤 Respuesta del backend para bebida customizada:',
          response.data
        );
        const productId =
          (response.data as any)?.id || (response.data as any)?.Id || 'temp-id';
        const productToAdd = {
          Id: productId,
          Name: beverageData.name,
          Price: beverageData.price,
          Description: beverageData.description,
        };

        // Agregar al caché para futuras consultas
        CustomProductCache.addProduct({
          id: productId,
          name: beverageData.name,
          description: beverageData.description,
          type: 'beverage',
        });

        console.log('🛒 Producto a agregar al carrito:', productToAdd);
        onSuccess(productToAdd);
      }

      onClose();
    } catch (error) {
      toast.error('Error al crear la bebida personalizada');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBeveragePrice = (type: string, size: string) => {
    let basePrice = 8; // Precio por defecto

    // Precio base por tipo (para tamaño 12oz)
    switch (type) {
      case 'atole':
        basePrice = 8;
        break;
      case 'agua':
        basePrice = 3;
        break;
      case 'jugo':
        basePrice = 5;
        break;
      case 'café':
        basePrice = 6;
        break;
      default:
        basePrice = 8;
    }

    // Multiplicador por tamaño
    if (size === '1L') {
      basePrice *= 2.5; // 1L cuesta 2.5 veces más que 12oz
    }

    return Math.round(basePrice); // Redondear para evitar decimales extraños
  };

  const handleInputChange = (field: keyof CustomProductRequest, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Actualizar precio automáticamente según tipo y tamaño
      if (field === 'type' || field === 'size') {
        const type = field === 'type' ? value : prev.type || 'atole';
        const size = field === 'size' ? value : prev.size || '12oz';
        newData.price = calculateBeveragePrice(type, size);
      }

      return newData;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            🥤 Crear Bebida Personalizada
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio ($) - Automático
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  handleInputChange('price', parseFloat(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                placeholder="Se calcula automáticamente"
                required
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                12oz - Atole : $8 | Pinol: $3 | Cacao batido: $5 | 1L: ×2.5
                veces
              </p>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño *
              </label>
              <select
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="12oz">Vaso 12 oz</option>
                <option value="1L">Jarro 1 L</option>
              </select>
            </div> */}
          </div>

          {/* Información generada automáticamente */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                <strong>Nombre:</strong> {formData.type} de {formData.sweetener}{' '}
                con {formData.topping}
              </p>
              <p>
                <strong>Descripción:</strong> {formData.type} personalizado con
                endulzante {formData.sweetener}, topping {formData.topping},
                tamaño {formData.size}
              </p>
              {/* <p><strong>Stock:</strong> 1 (por defecto)</p> */}
            </div>
          </div>

          {/* Atributos de la bebida */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Bebida *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="atole_elote">Atol de Elote</option>
                <option value="atole_shuco">Atole Shuco</option>
                <option value="pinol">Pinol</option>
                <option value="cacao">Cacao Batido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endulzante *
              </label>
              <select
                value={formData.sweetener}
                onChange={(e) => handleInputChange('sweetener', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="panela">Panela</option>
                <option value="panela">Panela</option>
                <option value="miel">Miel</option>
                <option value="sin">Sin Azúcar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topping *
              </label>
              <select
                value={formData.topping}
                onChange={(e) => handleInputChange('topping', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="malvaviscos">Malvaviscos</option>
                <option value="canela">Canela</option>
                <option value="ralladura_cacao">Ralladura de Cacao</option>
                <option value="crema">Crema</option>
                <option value="ninguno">Ninguno</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño *
              </label>
              <select
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="12oz">Vaso 12 oz</option>
                <option value="1L">Jarro 1 L</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-4">
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
              {loading ? 'Creando...' : 'Crear Bebida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
