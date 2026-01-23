'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Package, ShoppingCart, LayoutDashboard, Menu, X, TrendingUp, Trash2, Calendar, Brain, ChevronLeft, ChevronRight, Receipt } from 'lucide-react';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Load sidebar state from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (savedState === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
  };

  // Prevent flash by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
        <aside className="hidden lg:flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white shadow-2xl transition-all duration-300 relative w-64">
          <div className="p-6 border-b border-slate-700 dark:border-gray-800">
            <Link href="/admin" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <ShoppingBag className="w-8 h-8 text-blue-400 flex-shrink-0" />
              <div>
                <h1 className="text-xl font-bold">La Receta Secreta</h1>
                <p className="text-xs text-slate-400">Panel Admin</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
            {/* Placeholder during SSR */}
          </nav>
        </aside>
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
          <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white shadow-xl border-b border-slate-700 dark:border-gray-800">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <Link href="/admin" className="flex items-center space-x-2">
                  <ShoppingBag className="w-6 h-6 text-blue-400" />
                  <div>
                    <h1 className="text-lg font-bold">La Receta Secreta</h1>
                    <p className="text-xs text-slate-400">Panel Admin</p>
                  </div>
                </Link>
                <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </header>
        </div>
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 mt-16 lg:mt-0">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white shadow-2xl transition-all duration-300 relative ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700 dark:border-gray-800">
          <Link href="/admin" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <ShoppingBag className="w-8 h-8 text-blue-400 flex-shrink-0" />
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold">La Receta Secreta</h1>
                <p className="text-xs text-slate-400">Panel Admin</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <SidebarLink 
            href="/admin" 
            icon={<LayoutDashboard className="w-5 h-5" />}
            active={pathname === '/admin'}
            collapsed={sidebarCollapsed}
          >
            Dashboard
          </SidebarLink>
          <SidebarLink 
            href="/admin/productos" 
            icon={<Package className="w-5 h-5" />}
            active={pathname.startsWith('/admin/productos')}
            collapsed={sidebarCollapsed}
          >
            Productos
          </SidebarLink>
          <SidebarLink 
            href="/admin/pedidos" 
            icon={<ShoppingCart className="w-5 h-5" />}
            active={pathname.startsWith('/admin/pedidos')}
            collapsed={sidebarCollapsed}
          >
            Pedidos
          </SidebarLink>
          <SidebarLink 
            href="/admin/rentabilidad" 
            icon={<TrendingUp className="w-5 h-5" />}
            active={pathname.startsWith('/admin/rentabilidad')}
            collapsed={sidebarCollapsed}
          >
            Rentabilidad
          </SidebarLink>
          <SidebarLink 
            href="/admin/mermas" 
            icon={<Trash2 className="w-5 h-5" />}
            active={pathname.startsWith('/admin/mermas')}
            collapsed={sidebarCollapsed}
          >
            Mermas
          </SidebarLink>
          <SidebarLink 
            href="/admin/compras" 
            icon={<Receipt className="w-5 h-5" />}
            active={pathname.startsWith('/admin/compras')}
            collapsed={sidebarCollapsed}
          >
            Compras
          </SidebarLink>
          <SidebarLink 
            href="/admin/calendario" 
            icon={<Calendar className="w-5 h-5" />}
            active={pathname.startsWith('/admin/calendario')}
            collapsed={sidebarCollapsed}
          >
            Calendario
          </SidebarLink>
          <SidebarLink 
            href="/admin/analytics" 
            icon={<Brain className="w-5 h-5" />}
            active={pathname.startsWith('/admin/analytics')}
            collapsed={sidebarCollapsed}
          >
            Analytics IA
          </SidebarLink>
        </nav>

        {/* Collapse Toggle Button - Floating */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg z-10"
          aria-label="Toggle sidebar"
          title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
          )}
        </button>
      </aside>

      {/* Mobile Header & Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white shadow-xl border-b border-slate-700 dark:border-gray-800">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
                <div>
                  <h1 className="text-lg font-bold">La Receta Secreta</h1>
                  <p className="text-xs text-slate-400">Panel Admin</p>
                </div>
              </Link>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-lg">
            <nav className="px-4 py-3">
              <div className="flex flex-col space-y-1">
                <MobileNavLink 
                  href="/admin" 
                  icon={<LayoutDashboard className="w-5 h-5" />}
                  active={pathname === '/admin'}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </MobileNavLink>
                <MobileNavLink 
                  href="/admin/productos" 
                  icon={<Package className="w-5 h-5" />}
                  active={pathname.startsWith('/admin/productos')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Productos
                </MobileNavLink>
                <MobileNavLink 
                  href="/admin/pedidos" 
                  icon={<ShoppingCart className="w-5 h-5" />}
                  active={pathname.startsWith('/admin/pedidos')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pedidos
                </MobileNavLink>
                <MobileNavLink 
                  href="/admin/rentabilidad" 
                  icon={<TrendingUp className="w-5 h-5" />}
                  active={pathname.startsWith('/admin/rentabilidad')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Rentabilidad
                </MobileNavLink>
                <MobileNavLink 
                  href="/admin/mermas" 
                  icon={<Trash2 className="w-5 h-5" />}
                  active={pathname.startsWith('/admin/mermas')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mermas
                </MobileNavLink>
                <MobileNavLink 
                  href="/admin/compras" 
                  icon={<Receipt className="w-5 h-5" />}
                  active={pathname.startsWith('/admin/compras')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Compras
                </MobileNavLink>
                <MobileNavLink 
                  href="/admin/calendario" 
                  icon={<Calendar className="w-5 h-5" />}
                  active={pathname.startsWith('/admin/calendario')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Calendario
                </MobileNavLink>
                <MobileNavLink 
                  href="/admin/analytics" 
                  icon={<Brain className="w-5 h-5" />}
                  active={pathname.startsWith('/admin/analytics')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Analytics IA
                </MobileNavLink>
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 mt-16 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({ 
  href, 
  icon, 
  children,
  active,
  collapsed
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all group ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
      title={collapsed ? children as string : undefined}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{children}</span>}
    </Link>
  );
}

function MobileNavLink({ 
  href, 
  icon, 
  children,
  active,
  onClick
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
        active
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
