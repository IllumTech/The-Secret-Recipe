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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
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

      {/* Row 3: Description */}
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
