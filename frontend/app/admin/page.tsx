'use client';

import { Package, ShoppingCart, TrendingUp, DollarSign, ArrowUpRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
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
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Bienvenido al panel de administración</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Productos"
          value={totalProducts}
          icon={<Package className="w-6 h-6 sm:w-8 sm:h-8" />}
          color="blue"
          subtitle={`${activeProducts} activos`}
          trend="+12%"
        />
        <StatCard
          title="Total Pedidos"
          value={totalOrders}
          icon={<ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />}
          color="green"
          subtitle={`${pendingOrders} pendientes`}
          trend="+8%"
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />}
          color="purple"
          subtitle="Todos los tiempos"
          trend="+23%"
        />
        <StatCard
          title="Completados"
          value={completedOrders}
          icon={<CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />}
          color="emerald"
          subtitle={`${totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}% del total`}
          trend="+15%"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Acciones Rápidas</h2>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <QuickActionButton
            href="/admin/productos?nuevo=true"
            icon={<Package className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Crear Producto"
            description="Agregar nuevo producto"
            color="blue"
          />
          <QuickActionButton
            href="/admin/productos"
            icon={<Package className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Ver Productos"
            description="Gestionar catálogo"
            color="green"
          />
          <QuickActionButton
            href="/admin/pedidos"
            icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Ver Pedidos"
            description="Revisar pedidos"
            color="purple"
          />
        </div>
      </div>

      {/* Recent Orders & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Pedidos Recientes</h2>
            <Link 
              href="/admin/pedidos"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
            >
              Ver todos
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors border border-slate-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm sm:text-base">No hay pedidos recientes</p>
            </div>
          )}
        </div>

        {/* Status Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200 dark:border-gray-700">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Estado de Pedidos</h2>
          <div className="space-y-4">
            <StatusItem
              label="Pendientes"
              value={pendingOrders}
              total={totalOrders}
              color="yellow"
              icon={<Clock className="w-5 h-5" />}
            />
            <StatusItem
              label="En Proceso"
              value={orders.filter(o => o.status === 'processing').length}
              total={totalOrders}
              color="blue"
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatusItem
              label="Completados"
              value={completedOrders}
              total={totalOrders}
              color="green"
              icon={<CheckCircle className="w-5 h-5" />}
            />
            <StatusItem
              label="Cancelados"
              value={orders.filter(o => o.status === 'cancelled').length}
              total={totalOrders}
              color="red"
              icon={<AlertCircle className="w-5 h-5" />}
            />
          </div>
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
  subtitle,
  trend
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: 'blue' | 'green' | 'purple' | 'orange' | 'emerald';
  subtitle?: string;
  trend?: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  };

  const bgClass = colorClasses[color].split(' ')[2] + ' ' + colorClasses[color].split(' ')[3];
  const textClass = colorClasses[color].split(' ')[4] + ' ' + colorClasses[color].split(' ')[5];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-slate-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-xl ${bgClass}`}>
          <div className={textClass}>
            {icon}
          </div>
        </div>
        {trend && (
          <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{value}</p>
      {subtitle && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
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
      className={`block p-4 sm:p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white hover:shadow-lg transition-all transform hover:-translate-y-1`}
    >
      <div className="mb-2 sm:mb-3">{icon}</div>
      <h3 className="font-bold text-base sm:text-lg mb-1">{title}</h3>
      <p className="text-xs sm:text-sm opacity-90">{description}</p>
    </Link>
  );
}

function StatusItem({
  label,
  value,
  total,
  color,
  icon
}: {
  label: string;
  value: number;
  total: number;
  color: 'yellow' | 'blue' | 'green' | 'red';
  icon: React.ReactNode;
}) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  const colorClasses = {
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{percentage}% del total</p>
        </div>
      </div>
      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}
