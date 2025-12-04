'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ConfirmacionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    const number = searchParams.get('orderNumber');
    if (!number) {
      router.push('/');
      return;
    }
    setOrderNumber(number);
  }, [searchParams, router]);

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              ¡Pedido Confirmado! 🎉
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Tu pedido ha sido procesado exitosamente
            </p>

            {/* Order Number */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Número de Pedido</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{orderNumber}</p>
            </div>

            {/* Information */}
            <div className="text-left bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                ¿Qué sigue?
              </h2>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Recibirás un email de confirmación con los detalles de tu pedido</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Nuestro equipo preparará tu pedido con mucho cuidado</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Te notificaremos cuando tu pedido esté en camino</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 dark:text-purple-400 mr-2">✓</span>
                  <span>Tiempo estimado de entrega: 30-45 minutos</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-800 dark:hover:to-pink-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Volver al Inicio
              </Link>
              <Link
                href="/productos"
                className="px-6 py-3 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 font-semibold rounded-lg border-2 border-purple-600 dark:border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-600 transition-all duration-300"
              >
                Ver Más Productos
              </Link>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ¿Tienes alguna pregunta? Contáctanos en{' '}
                <a href="mailto:soporte@thesecretrecipe.com" className="text-purple-600 dark:text-purple-400 hover:underline">
                  soporte@thesecretrecipe.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
