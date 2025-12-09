'use client';

import { useState } from 'react';
import { Package, User, Calendar, DollarSign, Filter } from 'lucide-react';
import useSWR from 'swr';
import { Order } from '@/lib/types';
import * as api from '@/lib/api';
import Link from 'next/link';

type OrderStatus = 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';

export default function OrdersListPage() {
  const { data: rawOrders = [], error, isLoading } = useSWR<any[]>('orders', api.getOrders, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });
  const [filterStatus, setFilterStatus] = useState<OrderStatus>('all');

  // Normalize orders to handle both 'total' and 'totalAmount' fields
  const orders: Order[] = rawOrders.map(order => ({
    ...order,
    totalAmount: order.totalAmount ?? order.total ?? 0
  }));

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-xl font-semibold mb-2">Error al cargar pedidos</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    const labels = {
      pending: 'Pendiente',
      processing: 'En Proceso',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return { 
      class: badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300', 
      label: labels[status as keyof typeof labels] || status 
    };
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">Pedidos</h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Gestiona los pedidos de tus clientes</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Filtrar por estado:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filterStatus === 'all'}
              onClick={() => setFilterStatus('all')}
            >
              Todos ({orders.length})
            </FilterButton>
            <FilterButton
              active={filterStatus === 'pending'}
              onClick={() => setFilterStatus('pending')}
            >
              Pendientes ({orders.filter(o => o.status === 'pending').length})
            </FilterButton>
            <FilterButton
              active={filterStatus === 'processing'}
              onClick={() => setFilterStatus('processing')}
            >
              En Proceso ({orders.filter(o => o.status === 'processing').length})
            </FilterButton>
            <FilterButton
              active={filterStatus === 'completed'}
              onClick={() => setFilterStatus('completed')}
            >
              Completados ({orders.filter(o => o.status === 'completed').length})
            </FilterButton>
            <FilterButton
              active={filterStatus === 'cancelled'}
              onClick={() => setFilterStatus('cancelled')}
            >
              Cancelados ({orders.filter(o => o.status === 'cancelled').length})
            </FilterButton>
          </div>
        </div>
      </div>

      {/* Orders List - Desktop Table / Mobile Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Número de Pedido</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
              {filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{order.customerName}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{order.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 dark:text-slate-100">{order.items.length} items</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100">
                        <DollarSign className="w-4 h-4" />
                        {order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-slate-200 dark:divide-gray-700">
          {filteredOrders.map((order) => {
            const statusBadge = getStatusBadge(order.status);
            return (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="block p-4 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="space-y-3">
                  {/* Header: Order Number & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                      <Package className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{order.orderNumber}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.class} flex-shrink-0`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">{order.customerName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{order.customerEmail}</div>
                    </div>
                  </div>

                  {/* Date, Items & Total */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        {order.items.length} items
                      </div>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-30" />
            <p className="text-sm sm:text-base">No se encontraron pedidos</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
        active
          ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-md'
          : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
