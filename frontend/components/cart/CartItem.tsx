'use client';

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

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-4xl">
        {categoryEmoji}
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>
        {product.isOnPromotion && product.promotionalPrice ? (
          <div className="mt-1">
            <p className="text-sm text-gray-400 line-through">
              ${product.price.toFixed(2)}
            </p>
            <p className="text-lg font-bold text-red-600">
              ${product.promotionalPrice.toFixed(2)}
            </p>
          </div>
        ) : (
          <p className="text-lg font-bold text-purple-600 mt-1">
            ${product.price.toFixed(2)}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(product.id)}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="Eliminar producto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            aria-label="Disminuir cantidad"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          
          <span className="w-12 text-center font-semibold text-gray-800">{quantity}</span>
          
          <button
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors"
            aria-label="Aumentar cantidad"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <p className="text-lg font-bold text-gray-800">
          ${subtotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
