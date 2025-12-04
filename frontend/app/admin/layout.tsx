import Link from 'next/link';
import { ShoppingBag, Package, ShoppingCart, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <ShoppingBag className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold">La Receta Secreta</h1>
                <p className="text-sm text-slate-400">Panel de Administración</p>
              </div>
            </Link>
            <Link 
              href="/" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              Ver Sitio Público
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white shadow-md border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <NavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />}>
              Dashboard
            </NavLink>
            <NavLink href="/admin/productos" icon={<Package className="w-5 h-5" />}>
              Productos
            </NavLink>
            <NavLink href="/admin/pedidos" icon={<ShoppingCart className="w-5 h-5" />}>
              Pedidos
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-2 px-6 py-4 text-slate-700 hover:text-blue-600 hover:bg-blue-50 border-b-2 border-transparent hover:border-blue-600 transition-all font-medium"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
