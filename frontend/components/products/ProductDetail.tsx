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
  const [inputValue, setInputValue] = useState('1');
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

  const incrementQuantity = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    setInputValue(newQty.toString());
  };
  
  const decrementQuantity = () => {
    const newQty = Math.max(1, quantity - 1);
    setQuantity(newQty);
    setInputValue(newQty.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value === '') return;
    
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setQuantity(Math.max(1, Math.min(100, numValue)));
    }
  };

  const handleInputBlur = () => {
    if (inputValue === '' || parseInt(inputValue) < 1) {
      setQuantity(1);
      setInputValue('1');
    } else {
      setInputValue(quantity.toString());
    }
  };

  return (
    <>
      {/* Toast Notification - Portal to body */}
      {mounted && showToast && createPortal(
        <div 
          className="fixed top-4 right-4 z-[9999] animate-fade-in-down cursor-pointer"
          onClick={() => setShowToast(false)}
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-semibold text-sm">¡Agregado al carrito!</p>
              <p className="text-xs opacity-90">{toastQuantity} {product.name}</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
      {/* Imagen del producto y badges */}
      <div className="space-y-3">
        <div className="relative h-[350px] bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl overflow-hidden shadow-lg group">
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
          {/* Category Badge */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md z-10">
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 capitalize flex items-center gap-1.5">
              <span>{categoryEmoji}</span>
              <span>{product.category}</span>
            </span>
          </div>

          {/* Promotion Badge */}
          {product.isOnPromotion && (
            <div className="absolute top-4 left-4 right-4 flex justify-start">
              <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-xl animate-pulse max-w-[calc(100%-5rem)]">
                <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                  <span className="text-base sm:text-xl">🔥</span>
                  <span className="truncate">¡OFERTA ESPECIAL!</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Badges de características - Movidos aquí */}
        <div className="flex gap-2 justify-center">
          <div className="px-3 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center gap-1.5">
            <span className="text-sm">✅</span>
            <span className="text-xs font-semibold text-green-700 dark:text-green-400">Natural</span>
          </div>
          <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center gap-1.5">
            <span className="text-sm">❄️</span>
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Fresco</span>
          </div>
          <div className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">Premium</span>
          </div>
        </div>
      </div>

      {/* Información del producto */}
      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 font-display">
            {product.name}
          </h1>
          
          {product.isOnPromotion && product.promotionalPrice ? (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  -{getDiscountPercentage(product)}% OFF
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
                  ${product.promotionalPrice.toFixed(2)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">por unidad</span>
              </div>
              <div className="mt-1 inline-block bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-2 py-1">
                <span className="text-green-700 dark:text-green-400 font-semibold text-xs">
                  ¡Ahorras ${getSavingsAmount(product).toFixed(2)}!
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">por unidad</span>
            </div>
          )}

          {product.description && (
            <div className="mb-2 p-3 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>

        {/* Controles de cantidad y botón */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cantidad</span>
            <div className="flex items-center gap-2">
              <button
                onClick={decrementQuantity}
                className="w-8 h-8 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg font-bold text-lg text-gray-700 dark:text-gray-300 shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max="100"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="w-16 text-center text-xl font-bold text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none py-1"
              />
              <button
                onClick={incrementQuantity}
                className="w-8 h-8 bg-primary-500 dark:bg-primary-600 hover:bg-primary-600 dark:hover:bg-primary-700 rounded-lg font-bold text-lg text-white shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full py-3 text-base flex items-center justify-center gap-2"
          >
            <span>Agregar al Carrito</span>
            <span className="text-lg">🛒</span>
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}
