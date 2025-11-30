'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const categoryEmoji = product.category === 'helado' ? '🍦' : '🍰';

  const handleAddToCart = () => {
    addItem(product, quantity);
    alert(`${quantity} ${product.name} agregado(s) al carrito!`);
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Imagen del producto */}
      <div className="relative h-[320px] bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl overflow-hidden shadow-lg group">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-8xl">
            {categoryEmoji}
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
          <span className="text-sm font-semibold text-primary-600 capitalize flex items-center gap-1.5">
            <span>{categoryEmoji}</span>
            <span>{product.category}</span>
          </span>
        </div>
      </div>

      {/* Información del producto */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 font-display">
            {product.name}
          </h1>
          
          <div className="flex items-baseline mb-4">
            <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-gray-500 text-sm ml-2">por unidad</span>
          </div>

          {product.description && (
            <div className="mb-4 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
              <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Badges de características */}
          <div className="flex gap-2 mb-4">
            <div className="px-3 py-1.5 bg-green-50 rounded-lg flex items-center gap-1.5">
              <span className="text-sm">✅</span>
              <span className="text-xs font-semibold text-green-700">Natural</span>
            </div>
            <div className="px-3 py-1.5 bg-blue-50 rounded-lg flex items-center gap-1.5">
              <span className="text-sm">❄️</span>
              <span className="text-xs font-semibold text-blue-700">Fresco</span>
            </div>
            <div className="px-3 py-1.5 bg-purple-50 rounded-lg flex items-center gap-1.5">
              <span className="text-sm">⭐</span>
              <span className="text-xs font-semibold text-purple-700">Premium</span>
            </div>
          </div>
        </div>

        {/* Controles de cantidad y botón */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="text-sm font-semibold text-gray-700">Cantidad</span>
            <div className="flex items-center gap-3">
              <button
                onClick={decrementQuantity}
                className="w-10 h-10 bg-white hover:bg-gray-100 rounded-lg font-bold text-xl text-gray-700 shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
              >
                −
              </button>
              <span className="text-2xl font-bold w-12 text-center text-primary-600">
                {quantity}
              </span>
              <button
                onClick={incrementQuantity}
                className="w-10 h-10 bg-primary-500 hover:bg-primary-600 rounded-lg font-bold text-xl text-white shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full py-3.5 text-lg flex items-center justify-center gap-2"
          >
            <span>Agregar al Carrito</span>
            <span className="text-xl">🛒</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
