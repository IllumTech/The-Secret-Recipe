'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  orderNumber: string;
  onClose: () => void;
}

export default function OrderConfirmationModal({ 
  isOpen, 
  orderNumber, 
  onClose 
}: OrderConfirmationModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all" onClick={(e) => e.stopPropagation()}>
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
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
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">
          ¡Pedido Confirmado! 🎉
        </h2>
        
        <p className="text-gray-600 mb-6 text-center">
          Tu pedido ha sido procesado exitosamente
        </p>

        {/* Order Number */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 mb-6">
          <p className="text-sm text-gray-600 mb-1 text-center">Número de Pedido</p>
          <p className="text-2xl font-bold text-purple-600 text-center tracking-wide">
            {orderNumber}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
            Estado: Pendiente
          </span>
        </div>

        {/* Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2 mt-0.5">✓</span>
              <span>Recibirás un email de confirmación</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2 mt-0.5">✓</span>
              <span>Tiempo estimado: 30-45 minutos</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2 mt-0.5">✓</span>
              <span>Te notificaremos cuando esté en camino</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div>
          <Link
            href="/"
            className="block w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
            onClick={onClose}
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
