import React, { useState } from 'react';
import { CustomProductService } from '../services/customProductService';
import type { CustomProductRequest } from '../types/customProducts';
import { CustomProductCache } from '../utils/customProductCache';
import toast from 'react-hot-toast';
import type { CustomTamalCreatorProps } from '../types/custom';

export default function CustomTamalCreator({
  onClose,
  onSuccess,
}: CustomTamalCreatorProps) {
  const [formData, setFormData] = useState<CustomProductRequest>({
    //placeholder
    price: 12,
    active: true,
    doughType: 'amarillo',
    filling: 'cerdo',
    wrapper: 'plátano',
    spiceLevel: 'suave',
    quantity: 1,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.price <= 0) {
      toast.error('Por favor ingresa un precio válido');
      return;
    }

    const tamalData = {
      ...formData,
      name: `Tamal ${formData.doughType} con ${formData.filling}`,
      description: `Tamal personalizado con masa ${formData.doughType}, relleno de ${formData.filling}, envuelto en ${formData.wrapper}, nivel ${formData.spiceLevel}, ${formData.quantity} unidad${formData.quantity && formData.quantity > 1 ? 'es' : ''}`,
      stock: 1, // Stock por defecto
    };

    setLoading(true);
    try {
      const response = await CustomProductService.createCustomTamal(tamalData);
      // toast.success('¡Tamal personalizado creado y añadido al carrito!');

      if (response.data) {
        const productId =
          (response.data as any)?.id || (response.data as any)?.Id || 'temp-id';
        const unitPrice =
          (tamalData.quantity || 1) === 1
            ? tamalData.price
            : tamalData.price / (tamalData.quantity || 1);

        const productToAdd = {
          Id: productId,
          Name: tamalData.name,
          Price: unitPrice,
          Description: tamalData.description,
          quantity: tamalData.quantity,
        };

        CustomProductCache.addProduct({
          id: productId,
          name: tamalData.name,
          description: tamalData.description,
          type: 'tamal',
        });

        onSuccess(productToAdd);
      }

      onClose();
    } catch (error) {
      toast.error('Error al crear el tamal personalizado');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (filling: string, quantity: number) => {
    let unitPrice = 8;

    if (filling === 'pollo') {
      unitPrice = 6;
    } else if (filling === 'cerdo' || filling === 'res') {
      unitPrice = 12;
    } else {
      unitPrice = 8;
    }

    return unitPrice * quantity;
  };

  const handleInputChange = (field: keyof CustomProductRequest, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Actualizar precio automáticamente según el relleno Y cantidad
      if (field === 'filling' || field === 'quantity') {
        const filling =
          field === 'filling' ? value : prev.filling || 'vegetariano';
        const quantity = field === 'quantity' ? value : prev.quantity || 1;
        newData.price = calculatePrice(filling, quantity);
      }

      return newData;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            🌽 Crear Tamal Personalizado
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
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                placeholder="Se calcula automáticamente"
                required
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Pollo: $6/unidad | Cerdo/Res: $12/unidad | Otros: $8/unidad
              </p>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad *
              </label>
              <select
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value={1}>1 unidad</option>
                <option value={6}>6 unidades</option>
                <option value={12}>12 unidades</option>
              </select>
            </div> */}
          </div>

          {/* Información generada automáticamente */}
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="text-sm text-orange-700 space-y-1">
              <p>
                <strong>Nombre:</strong> Tamal {formData.doughType} con{' '}
                {formData.filling}
              </p>
              <p>
                <strong>Descripción:</strong> Tamal personalizado con masa{' '}
                {formData.doughType}, relleno de {formData.filling}, envuelto en{' '}
                {formData.wrapper}, nivel {formData.spiceLevel},{' '}
                {typeof formData.quantity === 'number' ? (
                  <>
                    {formData.quantity} unidad
                    {formData.quantity > 1 ? 'es' : ''}
                  </>
                ) : (
                  'Cantidad no especificada'
                )}
              </p>
              {/* <p><strong>Stock:</strong> 1 (por defecto)</p> */}
            </div>
          </div>

          {/* Atributos del tamal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Masa *
              </label>
              <select
                value={formData.doughType}
                onChange={(e) => handleInputChange('doughType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="amarillo">Maíz Amarillo</option>
                <option value="blanco">Maíz Blanco</option>
                <option value="arroz">Arroz</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relleno *
              </label>
              <select
                value={formData.filling}
                onChange={(e) => handleInputChange('filling', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="cerdo">Recado Rojo de Cerdo</option>
                <option value="pollo">Negro de Pollo</option>
                <option value="vegetariano">Chipilín Vegetariano</option>
                <option value="chuchito">Mezcla Estilo Chuchito</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Envoltura *
              </label>
              <select
                value={formData.wrapper}
                onChange={(e) => handleInputChange('wrapper', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="plátano">Hoja de Plátano</option>
                <option value="tusa">Tusa de Maíz</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Picante *
              </label>
              <select
                value={formData.spiceLevel}
                onChange={(e) =>
                  handleInputChange('spiceLevel', e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="sin">Sin Chile</option>
                <option value="suave">Suave</option>
                <option value="chapín">Chapín</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad *
              </label>
              <select
                value={formData.quantity}
                onChange={(e) =>
                  handleInputChange('quantity', parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value={1}>1 unidad</option>
                <option value={6}>6 unidades</option>
                <option value={12}>12 unidades</option>
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
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Tamal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
