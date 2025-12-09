'use client';

import React from 'react';
import { CartItem as CartItemType } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { getDisplayPrice } from '@/lib/pricing';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const displayPrice = getDisplayPrice(product);
  const subtotal = displayPrice * quantity;
  const categoryEmoji = product.category === 'helado' ? '🍦' : '🍰';
  const [inputValue, setInputValue] = React.useState(quantity.toString());

  React.useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value === '') return;
    
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      updateQuantity(product.id, Math.max(1, Math.min(100, numValue)));
    }
  };

  const handleInputBlur = () => {
    if (inputValue === '' || parseInt(inputValue) < 1) {
      updateQuantity(product.id, 1);
      setInputValue('1');
    } else {
      setInputValue(quantity.toString());
    }
  };

  return (
    <div className="relative flex gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg dark:shadow-gray-900/50 transition-shadow duration-300">
      {/* Delete button - absolute positioned */}
      <button
        onClick={() => removeItem(product.id)}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors z-10"
        aria-label="Eliminar producto"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image */}
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-3xl sm:text-4xl">
            {categoryEmoji}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 capitalize mb-2">
          {product.category}
        </p>
        
        {/* Price */}
        {product.isOnPromotion && product.promotionalPrice ? (
          <div className="mb-3">
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 line-through">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
              ${product.promotionalPrice.toFixed(2)}
            </p>
          </div>
        ) : (
          <p className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400 mb-3">
            ${product.price.toFixed(2)}
          </p>
        )}

        {/* Quantity controls and subtotal */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Disminuir cantidad"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <input
              type="number"
              min="1"
              max="100"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-12 sm:w-14 text-center text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none py-1"
            />
            
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Aumentar cantidad"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
            ${subtotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
