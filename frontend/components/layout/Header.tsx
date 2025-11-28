'use client';

import Link from 'next/link';
import CartButton from '@/components/cart/CartButton';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-pink-100">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
              🍦
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display gradient-text">
                The Secret Recipe
              </h1>
              <p className="text-xs text-gray-500 font-medium">Artisan Delights</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
            >
              Inicio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/admin" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group"
            >
              Admin
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>
          
          <CartButton />
        </div>
      </div>
    </header>
  );
}
