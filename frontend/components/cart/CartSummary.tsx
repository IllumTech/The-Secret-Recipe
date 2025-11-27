'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function CartSummary() {
  const { totalAmount, totalItems } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumen del Pedido</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-600">
          <span>Productos ({totalItems})</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          <span className="text-green-600 font-medium">GRATIS</span>
        </div>
        
        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between text-xl font-bold text-gray-800">
            <span>Total</span>
            <span className="text-purple-600">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Proceder al Checkout
      </Link>

      <div className="mt-4 text-center">
        <Link
          href="/"
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          ← Continuar Comprando
        </Link>
      </div>
    </div>
  );
}
