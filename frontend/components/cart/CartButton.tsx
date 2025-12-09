'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import CartModal from './CartModal';

interface CartButtonProps {
  className?: string;
}

export default function CartButton({ className = '' }: CartButtonProps) {
  const { totalItems } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white rounded-full hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl dark:shadow-purple-900/50 backdrop-blur-sm bg-opacity-95 hover:bg-opacity-100 ${className}`}
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span className="font-medium hidden sm:inline">Carrito</span>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-md dark:shadow-red-900/50">
            {totalItems}
          </span>
        )}
      </button>

      <CartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
