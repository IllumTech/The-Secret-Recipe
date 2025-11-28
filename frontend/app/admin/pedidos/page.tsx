'use client';

import { useState } from 'react';
import { Package, User, Calendar, DollarSign, Filter } from 'lucide-react';

// Mock orders data - será reemplazado con datos reales de la API
const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: 'Juan Pérez',
    customerEmail: 'juan@example.com',
    total: 45.50,
    status: 'pending',
    createdAt: new Date('2024-01-15'),
    items: 3,
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerName: 'María García',
    customerEmail: 'maria@example.com',
    total: 32.00,
    status: 'completed',
    createdAt: new Date('2024-01-14'),
    items: 2,
  },
];

type OrderStatus = 'all' | 'pending' | 'completed' | 'cancelled';

export default function OrdersListPage() {
  const [orders] = useState(mockOrders);
  const [filterStatus, setFilterStatus] = useState<OrderStatus>('all');

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: 'Pendiente',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return { class: badges[status as keyof typeof badges], label: labels[status as keyof typeof labels] };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Pedidos</h1>
        <p className="text-slate-600">Gestiona los pedidos de tus clientes</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Filtrar por estado:</span>
          <div className="flex gap-2">
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

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Número de Pedido</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Items</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900">{order.customerName}</div>
                          <div className="text-sm text-slate-500">{order.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{order.createdAt.toLocaleDateString('es-ES')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900">{order.items} items</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-900">
                        <DollarSign className="w-4 h-4" />
                        {order.total.toFixed(2)}
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

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No se encontraron pedidos</p>
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
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}
