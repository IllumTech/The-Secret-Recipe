'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import * as api from '@/lib/api';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Partial<Product>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'helado',
    price: product?.price || 0,
    description: product?.description || '',
    image: product?.image || '',
    isOnPromotion: product?.isOnPromotion || false,
    promotionalPrice: product?.promotionalPrice || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'price' || name === 'promotionalPrice') ? parseFloat(value) || 0 : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Requerido';
    if (formData.price <= 0) newErrors.price = 'Debe ser mayor a 0';
    if (!formData.category) newErrors.category = 'Requerido';
    
    // Promotion validation
    if (formData.isOnPromotion) {
      if (!formData.promotionalPrice || formData.promotionalPrice <= 0) {
        newErrors.promotionalPrice = 'El precio promocional es requerido y debe ser mayor a 0';
      } else if (formData.promotionalPrice >= formData.price) {
        newErrors.promotionalPrice = 'El precio promocional debe ser menor al precio original';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Only include promotionalPrice if promotion is enabled
        promotionalPrice: formData.isOnPromotion ? formData.promotionalPrice : undefined,
      };
      onSubmit(submitData);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!formData.name.trim()) {
      setErrors({ name: 'Ingresa un nombre primero' });
      return;
    }

    setIsGenerating(true);
    try {
      const { description, imageUrl } = await api.generateProductContent(
        formData.name,
        formData.category
      );
      
      setFormData(prev => ({
        ...prev,
        description,
        image: imageUrl,
      }));
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error al generar contenido con IA. Por favor intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Row 1: Name and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Nombre *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Helado de Vainilla"
            disabled={isLoading}
            className="h-11"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">
            Categoría *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full h-11 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            <option value="helado">🍦 Helado</option>
            <option value="postre">🍰 Postre</option>
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
        </div>
      </div>

      {/* Row 2: Price and Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1.5">
            Precio *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              disabled={isLoading}
              className="pl-8 h-11"
            />
          </div>
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-slate-700 mb-1.5">
            Imagen (emoji)
          </label>
          <Input
            id="image"
            name="image"
            type="text"
            value={formData.image}
            onChange={handleChange}
            placeholder="🍦"
            disabled={isLoading}
            className="h-11 text-center text-2xl"
            maxLength={2}
          />
        </div>
      </div>

      {/* Row 3: Promotion Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            id="isOnPromotion"
            name="isOnPromotion"
            checked={formData.isOnPromotion}
            onChange={handleChange}
            disabled={isLoading}
            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
          />
          <label htmlFor="isOnPromotion" className="text-sm font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span>En Promoción</span>
          </label>
        </div>

        {formData.isOnPromotion && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label htmlFor="promotionalPrice" className="block text-sm font-medium text-slate-700 mb-1.5">
                Precio Promocional *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                <Input
                  id="promotionalPrice"
                  name="promotionalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.promotionalPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  disabled={isLoading}
                  className="pl-8 h-11"
                />
              </div>
              {errors.promotionalPrice && <p className="mt-1 text-xs text-red-600">{errors.promotionalPrice}</p>}
            </div>

            {formData.price > 0 && formData.promotionalPrice > 0 && formData.promotionalPrice < formData.price && (
              <div className="bg-white rounded-lg p-3 border border-red-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Descuento:</span>
                  <span className="text-lg font-bold text-red-600">
                    {Math.round(((formData.price - formData.promotionalPrice) / formData.price) * 100)}% OFF
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-slate-600">Ahorras:</span>
                  <span className="text-sm font-semibold text-green-600">
                    ${(formData.price - formData.promotionalPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Generation Button */}
      {!product && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={isLoading || isGenerating || !formData.name.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Sparkles className="w-5 h-5" />
            {isGenerating ? 'Generando con IA...' : 'Generar Descripción e Imagen con IA'}
          </button>
          <p className="text-xs text-slate-600 mt-2 text-center">
            Usa IA para generar automáticamente una descripción atractiva y una imagen del producto
          </p>
        </div>
      )}

      {/* Row 4: Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
          Descripción {isGenerating && <span className="text-purple-600 animate-pulse">(Generando...)</span>}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe el producto..."
          disabled={isLoading || isGenerating}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            Cancelar
          </button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2.5 text-sm"
        >
          {isLoading ? 'Guardando...' : product ? '✓ Actualizar' : '+ Crear Producto'}
        </Button>
      </div>
    </form>
  );
}
