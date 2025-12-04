'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function CartSummary() {
  const { totalAmount, totalItems } = useCart();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 p-6 sticky top-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Resumen del Pedido</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <span>Productos ({totalItems})</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <span>Envío</span>
          <span className="text-green-600 dark:text-green-400 font-medium">GRATIS</span>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-gray-100">
            <span>Total</span>
            <span className="text-purple-600 dark:text-purple-400">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white text-center font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl dark:shadow-purple-900/50 transform hover:-translate-y-0.5"
      >
        Proceder al Checkout
      </Link>

      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
        >
          ← Continuar Comprando
        </Link>
      </div>
    </div>
  );
}
