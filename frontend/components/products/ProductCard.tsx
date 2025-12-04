'use client';

import Image from 'next/image';
import { Product } from '@/lib/types';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { getDisplayPrice, getDiscountPercentage } from '@/lib/pricing';

interface ProductCardProps {
  product: Product;
  onProductClick?: (product: Product) => void;
}

export default function ProductCard({ product, onProductClick }: ProductCardProps) {
  const categoryEmoji = product.category === 'helado' ? '🍦' : '🍰';
  const [isHovered, setIsHovered] = useState(false);
  const { addItem, updateQuantity, removeItem, items } = useCart();
  
  // Get current quantity in cart
  const cartItem = items.find(item => item.product.id === product.id);
  const cartQuantity = cartItem?.quantity || 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleSubtract = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartQuantity === 1) {
      removeItem(product.id);
    } else if (cartQuantity > 1) {
      updateQuantity(product.id, cartQuantity - 1);
    }
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };
  
  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer"
    >
      <div className="relative h-56 w-full bg-white dark:bg-gray-700 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">
            {categoryEmoji}
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 capitalize">
            {categoryEmoji} {product.category}
          </span>
        </div>



        {/* Controles de cantidad - Esquina superior derecha */}
        <div 
          className="absolute top-3 right-3 z-20"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {cartQuantity === 0 ? (
            // Estado inicial: Solo botón +
            <div className="relative">
              <button
                onClick={handleAdd}
                className="w-10 h-10 bg-white dark:bg-gray-700 hover:bg-primary-500 dark:hover:bg-primary-600 text-primary-600 dark:text-primary-400 hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-100 ease-out flex items-center justify-center font-bold text-xl transform hover:scale-110 active:scale-95"
              >
                +
              </button>
              
              {/* Tooltip "Agregar" en hover */}
              {isHovered && (
                <div className="absolute top-12 right-0 bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap animate-fade-in">
                  Agregar
                  <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
                </div>
              )}
            </div>
          ) : (
            // Estado con cantidad: Mostrar controles completos
            <div className="flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg px-2 py-1 transition-all duration-100">
              <button
                onClick={handleSubtract}
                className="w-8 h-8 bg-white dark:bg-gray-700 hover:bg-red-500 hover:shadow-lg text-red-500 dark:text-red-400 hover:text-white rounded-full transition-all duration-100 ease-out flex items-center justify-center font-bold text-lg transform hover:scale-125 active:scale-95"
                title={cartQuantity === 1 ? 'Eliminar' : 'Restar'}
              >
                {cartQuantity === 1 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ) : '−'}
              </button>
              
              <span className="min-w-[24px] text-center font-bold text-gray-900 dark:text-gray-100 transition-all duration-100">
                {cartQuantity}
              </span>
              
              <button
                onClick={handleAdd}
                className="w-8 h-8 bg-white dark:bg-gray-700 hover:bg-primary-500 dark:hover:bg-primary-600 hover:shadow-lg text-primary-600 dark:text-primary-400 hover:text-white rounded-full transition-all duration-100 ease-out flex items-center justify-center font-bold text-lg transform hover:scale-125 active:scale-95"
                title="Agregar más"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2 min-h-[3.5rem] font-display">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="h-20 flex flex-col justify-end">
          {product.isOnPromotion && product.promotionalPrice ? (
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    -{getDiscountPercentage(product)}%
                  </span>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
                  ${product.promotionalPrice.toFixed(2)}
                </span>
              </div>
              <span className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap self-center">
                🔥 OFERTA
              </span>
            </div>
          ) : (
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-400 dark:to-accent-400 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
