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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
      <div className="relative h-[500px] bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl overflow-hidden shadow-2xl group">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-9xl">
            {categoryEmoji}
          </div>
        )}
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <span className="text-lg font-bold text-primary-600 capitalize flex items-center space-x-2">
            <span>{categoryEmoji}</span>
            <span>{product.category}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-display">
          {product.name}
        </h1>
        
        <div className="flex items-baseline mb-6">
          <span className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-gray-500 ml-3">por unidad</span>
        </div>

        {product.description && (
          <div className="mb-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl">
            <h2 className="text-xl font-bold mb-3 font-display flex items-center space-x-2">
              <span>📝</span>
              <span>Descripción</span>
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
          </div>
        )}

        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg">
          <label className="block text-lg font-bold mb-4 font-display flex items-center space-x-2">
            <span>🔢</span>
            <span>Cantidad</span>
          </label>
          <div className="flex items-center space-x-6">
            <button
              onClick={decrementQuantity}
              className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl font-bold text-2xl text-gray-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              −
            </button>
            <span className="text-3xl font-bold w-16 text-center text-primary-600">
              {quantity}
            </span>
            <button
              onClick={incrementQuantity}
              className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl font-bold text-2xl text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleAddToCart}
            className="w-full py-5 text-xl flex items-center justify-center space-x-3"
          >
            <span>Agregar al Carrito</span>
            <span className="text-2xl">🛒</span>
          </Button>
          
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="p-3 bg-green-50 rounded-xl">
              <div className="text-2xl mb-1">✅</div>
              <div className="font-semibold text-green-700">100% Natural</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="text-2xl mb-1">❄️</div>
              <div className="font-semibold text-blue-700">Fresco</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <div className="text-2xl mb-1">⭐</div>
              <div className="font-semibold text-purple-700">Premium</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
