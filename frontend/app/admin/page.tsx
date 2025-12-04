'use client';

import { Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useProducts } from '@/contexts/ProductContext';
import useSWR from 'swr';
import { Order } from '@/lib/types';
import * as api from '@/lib/api';

export default function AdminDashboard() {
  const { products } = useProducts();
  const { data: rawOrders = [] } = useSWR<any[]>('orders', api.getOrders);
  
  // Normalize orders to handle both 'total' and 'totalAmount' fields
  const orders = rawOrders.map(order => ({
    ...order,
    totalAmount: order.totalAmount ?? order.total ?? 0
  }));
  
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Resumen general de tu tienda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value={totalProducts}
          icon={<Package className="w-8 h-8" />}
          color="blue"
          subtitle={`${activeProducts} activos`}
        />
        <StatCard
          title="Total Pedidos"
          value={totalOrders}
          icon={<ShoppingCart className="w-8 h-8" />}
          color="green"
          subtitle="Todos los tiempos"
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-8 h-8" />}
          color="purple"
          subtitle="Todos los tiempos"
        />
        <StatCard
          title="Tasa de Conversión"
          value="0%"
          icon={<TrendingUp className="w-8 h-8" />}
          color="orange"
          subtitle="Últimos 30 días"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            href="/admin/productos?nuevo=true"
            icon={<Package className="w-6 h-6" />}
            title="Crear Producto"
            description="Agregar nuevo producto al catálogo"
            color="blue"
          />
          <QuickActionButton
            href="/admin/productos"
            icon={<Package className="w-6 h-6" />}
            title="Ver Productos"
            description="Gestionar productos existentes"
            color="green"
          />
          <QuickActionButton
            href="/admin/pedidos"
            icon={<ShoppingCart className="w-6 h-6" />}
            title="Ver Pedidos"
            description="Revisar pedidos de clientes"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Actividad Reciente</h2>
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>No hay actividad reciente</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: 'blue' | 'green' | 'purple' | 'orange';
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
    green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
    purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
    orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[2]}`}>
          <div className={colorClasses[color].split(' ')[1]}>
            {icon}
          </div>
        </div>
      </div>
      <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}

function QuickActionButton({ 
  href, 
  icon, 
  title, 
  description, 
  color 
}: { 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  };

  return (
    <Link
      href={href}
      className={`block p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white hover:shadow-lg transition-all transform hover:-translate-y-1`}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </Link>
  );
}
