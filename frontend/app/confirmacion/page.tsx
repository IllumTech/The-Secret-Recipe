'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-green-600"
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

            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              ¡Pedido Confirmado!
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
            </p>

            <div className="bg-purple-50 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">Número de Pedido</p>
              <p className="text-2xl font-bold text-purple-600">{orderNumber}</p>
            </div>

            <div className="space-y-4 text-left mb-8">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📧</div>
                <div>
                  <p className="font-semibold text-gray-800">Confirmación por Email</p>
                  <p className="text-sm text-gray-600">
                    Recibirás un email de confirmación con los detalles de tu pedido.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="text-2xl">🚚</div>
                <div>
                  <p className="font-semibold text-gray-800">Entrega Estimada</p>
                  <p className="text-sm text-gray-600">
                    Tu pedido será entregado en 2-3 días hábiles.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
