'use client';

import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export default function CheckoutPage() {
  const { items, totalAmount, totalItems } = useCart();
  const router = useRouter();
  const [orderCompleted, setOrderCompleted] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !orderCompleted) {
      router.push('/carrito');
    }
  }, [items, router, orderCompleted]);

  if (items.length === 0 && !orderCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
          Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2">
            <CheckoutForm onOrderComplete={() => setOrderCompleted(true)} />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-gray-200">{item.product.name}</p>
                      <p className="text-gray-500 dark:text-gray-400">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Envío</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">GRATIS</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-gray-100">
                    <span>Total</span>
                    <span className="text-purple-600 dark:text-purple-400">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
