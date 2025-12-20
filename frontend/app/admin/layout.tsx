'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Package, ShoppingCart, LayoutDashboard, Menu, X } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white shadow-xl border-b border-slate-700 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">La Receta Secreta</h1>
                <p className="text-xs sm:text-sm text-slate-400">Panel de Administración</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                href="/" 
                className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-xs sm:text-sm font-medium"
              >
                Ver Sitio Público
              </Link>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
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
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white dark:bg-gray-800 shadow-md border-b border-slate-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <NavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />} active={pathname === '/admin'}>
              Dashboard
            </NavLink>
            <NavLink href="/admin/productos" icon={<Package className="w-5 h-5" />} active={pathname.startsWith('/admin/productos')}>
              Productos
            </NavLink>
            <NavLink href="/admin/pedidos" icon={<ShoppingCart className="w-5 h-5" />} active={pathname.startsWith('/admin/pedidos')}>
              Pedidos
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 shadow-lg animate-fade-in">
          <nav className="container mx-auto px-4 py-3">
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
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Ver Sitio Público</span>
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-0 sm:px-4 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ 
  href, 
  icon, 
  children,
  active
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
        active
          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-b-2 border-blue-600 dark:border-blue-400'
          : 'text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 border-b-2 border-transparent hover:border-blue-600 dark:hover:border-blue-400'
      }`}
    >
      {icon}
      <span>{children}</span>
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
