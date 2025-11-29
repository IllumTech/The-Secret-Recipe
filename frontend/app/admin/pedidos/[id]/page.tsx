'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Order } from '@/lib/types';
import * as api from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Package, User, MapPin, Calendar, DollarSign } from 'lucide-react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const orders = await api.getOrders();
        const foundOrder = orders.find(o => o.id === orderId);
        if (!foundOrder) {
          setError('Pedido no encontrado');
        } else {
          setOrder(foundOrder);
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a Pedidos
        </Link>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Pedido no encontrado</h1>
          <p className="text-slate-600 mb-6">{error || 'El pedido que buscas no existe'}</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels = {
    pending: 'Pendiente',
    processing: 'En Proceso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Pedidos
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Detalle del Pedido</h1>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-6 border-b border-slate-200">
          <div>
            <p className="text-sm text-slate-500 mb-1">Número de Pedido</p>
            <p className="text-3xl font-bold text-blue-600">{order.orderNumber}</p>
            <p className="text-sm text-slate-500 mt-2">ID: {order.id}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border-2 ${statusColors[order.status as keyof typeof statusColors]}`}>
              <span className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></span>
              {statusLabels[order.status as keyof typeof statusLabels]}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Cliente</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">{order.customerName}</p>
              <p className="text-slate-600">{order.customerEmail}</p>
              {order.customerPhone && (
                <p className="text-slate-600">{order.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Dirección</h3>
            </div>
            <div className="text-sm text-slate-700">
              <p>{order.deliveryAddress.street}</p>
              <p>{order.deliveryAddress.city}{order.deliveryAddress.state && `, ${order.deliveryAddress.state}`}</p>
              {order.deliveryAddress.zipCode && <p>{order.deliveryAddress.zipCode}</p>}
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Información</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-500">Fecha de pedido</p>
                <p className="font-medium text-slate-900">
                  {new Date(order.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-slate-600">
                  {new Date(order.createdAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">Productos</h2>
        </div>

        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-4 px-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="flex items-center flex-1">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-3xl mr-4">
                  {item.image || '🍦'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{item.name}</h4>
                  <p className="text-sm text-slate-500">Cantidad: {item.quantity}</p>
                  <p className="text-sm text-slate-600">${item.price.toFixed(2)} c/u</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Envío</span>
            <span className="text-green-600 font-medium">GRATIS</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-slate-900 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              <span>Total</span>
            </div>
            <span className="text-blue-600">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
