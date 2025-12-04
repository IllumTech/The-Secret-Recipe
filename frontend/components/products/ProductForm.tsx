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
    price: product?.price || '',
    description: product?.description || '',
    imageUrl: product?.imageUrl || '',
    isOnPromotion: product?.isOnPromotion || false,
    promotionalPrice: product?.promotionalPrice || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Requerido';
    if (Number(formData.price) <= 0) newErrors.price = 'Debe ser mayor a 0';
    if (!formData.category) newErrors.category = 'Requerido';
    
    // Promotion validation
    if (formData.isOnPromotion) {
      if (!formData.promotionalPrice || Number(formData.promotionalPrice) <= 0) {
        newErrors.promotionalPrice = 'El precio promocional es requerido y debe ser mayor a 0';
      } else if (Number(formData.promotionalPrice) >= Number(formData.price)) {
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
        imageUrl: imageUrl,
      }));
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error al generar contenido con IA. Por favor intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const { imageUrl } = await api.uploadImage(file);
      setFormData(prev => ({
        ...prev,
        imageUrl,
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Row 1: Name and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
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
          {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Categoría *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="helado">🍦 Helado</option>
            <option value="postre">🍰 Postre</option>
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.category}</p>}
        </div>
      </div>

      {/* Row 2: Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Precio *
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">$</span>
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
        {errors.price && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.price}</p>}
      </div>

      {/* Image Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Imagen del Producto {isGenerating && <span className="text-purple-600 dark:text-purple-400 animate-pulse">(Generando con IA...)</span>}
          {isUploading && <span className="text-blue-600 dark:text-blue-400 animate-pulse">(Subiendo...)</span>}
        </label>
        
        <div className="space-y-3">
          {/* File Upload */}
          <div>
            <label htmlFor="fileUpload" className="block text-xs text-slate-600 dark:text-slate-400 mb-2">
              📁 Subir tu propia imagen
            </label>
            <input
              id="fileUpload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isLoading || isGenerating || isUploading}
              className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Máximo 5MB - JPG, PNG, GIF</p>
          </div>

          {/* URL Input */}
          <div>
            <label htmlFor="imageUrl" className="block text-xs text-slate-600 dark:text-slate-400 mb-2">
              🔗 O ingresa una URL
            </label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="text"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
              disabled={isLoading || isGenerating || isUploading}
              className="h-11"
            />
          </div>

          {/* Preview Button */}
          {formData.imageUrl && (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="w-full py-2 px-4 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver Vista Previa
            </button>
          )}
        </div>
      </div>

      {/* Row 3: Promotion Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            id="isOnPromotion"
            name="isOnPromotion"
            checked={formData.isOnPromotion}
            onChange={handleChange}
            disabled={isLoading}
            className="w-5 h-5 text-red-600 border-gray-300 dark:border-gray-600 rounded focus:ring-red-500 cursor-pointer"
          />
          <label htmlFor="isOnPromotion" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <span>En Promoción</span>
          </label>
        </div>

        {formData.isOnPromotion && (
          <div className="space-y-3 animate-fade-in">
            <div>
              <label htmlFor="promotionalPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Precio Promocional *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">$</span>
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
              {errors.promotionalPrice && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.promotionalPrice}</p>}
            </div>

            {formData.price > 0 && formData.promotionalPrice > 0 && formData.promotionalPrice < formData.price && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-300 dark:border-red-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Descuento:</span>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">
                    {Math.round(((formData.price - formData.promotionalPrice) / formData.price) * 100)}% OFF
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Ahorras:</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    ${(formData.price - formData.promotionalPrice).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Generation Button */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
        <button
          type="button"
          onClick={handleGenerateWithAI}
          disabled={isLoading || isGenerating || !formData.name.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-800 dark:hover:to-pink-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Sparkles className="w-5 h-5" />
          {isGenerating ? 'Generando con IA...' : 'Generar Descripción e Imagen con IA'}
        </button>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-center">
          Usa IA para generar automáticamente una descripción atractiva y una imagen del producto
        </p>
      </div>

      {/* Row 4: Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Descripción {isGenerating && <span className="text-purple-600 dark:text-purple-400 animate-pulse">(Generando...)</span>}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe el producto..."
          disabled={isLoading || isGenerating}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-2.5 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
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

      {/* Image Preview Modal */}
      {showPreview && formData.imageUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white dark:bg-gray-700 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Vista Previa de la Imagen</h3>
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.alt = 'Error al cargar imagen';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
