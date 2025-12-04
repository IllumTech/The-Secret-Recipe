'use client';

import { useCart } from '@/hooks/useCart';
import CartItem from './CartItem';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, totalAmount } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle opening and closing animations
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
      // Trigger animation after render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else if (shouldRender) {
      setIsAnimating(false);
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300); // Match animation duration
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!shouldRender) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity duration-300 ${
          isAnimating && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div 
        className={`absolute right-0 top-0 h-screen w-full sm:w-[480px] bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl overflow-hidden transition-transform duration-300 ease-out ${
          isAnimating && !isClosing ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-pink-100 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text">Tu Carrito</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-all flex-shrink-0"
                aria-label="Cerrar carrito"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cart Items - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🛒</div>
                <p className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl font-semibold">Tu carrito está vacío</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">¡Agrega algunos productos deliciosos!</p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all duration-300"
                >
                  Explorar Productos
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <CartItem key={item.product.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          {items.length > 0 && (
            <div className="flex-shrink-0 border-t border-purple-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                  Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})
                </span>
                <span className="text-xl sm:text-2xl font-bold gradient-text">${totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white py-3 sm:py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                >
                  Proceder al Pago 💳
                </Link>
                
                <Link
                  href="/carrito"
                  onClick={onClose}
                  className="block w-full bg-white dark:bg-gray-700 border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 py-2 sm:py-3 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-gray-600 transition-all text-center"
                >
                  Ver Carrito Completo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );

  // Use portal to render at document body level
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
