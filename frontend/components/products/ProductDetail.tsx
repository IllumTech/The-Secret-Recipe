'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Product } from '@/lib/types';
import Button from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { getDisplayPrice, getDiscountPercentage, getSavingsAmount } from '@/lib/pricing';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastQuantity, setToastQuantity] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { addItem } = useCart();
  const categoryEmoji = product.category === 'helado' ? '🍦' : '🍰';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setToastQuantity(quantity);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
  const decrementQuantity = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <>
      {/* Toast Notification - Portal to body */}
      {mounted && showToast && createPortal(
        <div 
          className="fixed top-4 right-4 z-[9999] animate-fade-in-down cursor-pointer"
          onClick={() => setShowToast(false)}
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-semibold text-sm">¡Agregado al carrito!</p>
              <p className="text-xs opacity-90">{toastQuantity} {product.name}</p>
            </div>
          </div>
        </div>,
        document.body
      )}

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

        {/* Promotion Badge */}
        {product.isOnPromotion && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full shadow-xl animate-pulse">
            <span className="text-sm font-bold flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span>¡OFERTA ESPECIAL!</span>
            </span>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 font-display">
            {product.name}
          </h1>
          
          {product.isOnPromotion && product.promotionalPrice ? (
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                  -{getDiscountPercentage(product)}% OFF
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  ${product.promotionalPrice.toFixed(2)}
                </span>
                <span className="text-gray-500 text-sm ml-2">por unidad</span>
              </div>
              <div className="mt-2 inline-block bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                <span className="text-green-700 font-semibold text-sm">
                  ¡Ahorras ${getSavingsAmount(product).toFixed(2)}!
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-gray-500 text-sm ml-2">por unidad</span>
            </div>
          )}

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
    </>
  );
}
