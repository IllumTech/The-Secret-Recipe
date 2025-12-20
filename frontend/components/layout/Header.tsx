'use client';

import { useState } from 'react';
import Link from 'next/link';
import CartButton from '@/components/cart/CartButton';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategoryClick = (category: string) => {
    // Cerrar menú móvil
    setMobileMenuOpen(false);
    
    // Disparar evento personalizado para cambiar categoría
    window.dispatchEvent(new CustomEvent('categoryChange', { detail: category }));
    
    // Scroll a productos
    const element = document.getElementById('productos');
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-pink-100 dark:border-gray-700">
        <div className="container-custom py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
                🍦
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display gradient-text">
                  La Receta Secreta
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Artisan Delights</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
              >
                Inicio
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <button
                onClick={() => handleCategoryClick('all')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
              >
                Productos
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button
                onClick={() => handleCategoryClick('helado')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
              >
                Helados
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button
                onClick={() => handleCategoryClick('postre')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
              >
                Postres
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
              </button>
              <button
                onClick={() => handleScrollToSection('nosotros')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
              >
                Nosotros
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
              </button>
            </nav>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              <CartButton />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-pink-100 dark:border-gray-700 bg-white dark:bg-gray-900 animate-fade-in">
            <nav className="container-custom py-4 flex flex-col space-y-3">
              <Link 
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-800"
              >
                🏠 Inicio
              </Link>
              <button
                onClick={() => handleCategoryClick('all')}
                className="text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-800"
              >
                🎯 Productos
              </button>
              <button
                onClick={() => handleCategoryClick('helado')}
                className="text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-800"
              >
                🍦 Helados
              </button>
              <button
                onClick={() => handleCategoryClick('postre')}
                className="text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-800"
              >
                🍰 Postres
              </button>
              <button
                onClick={() => handleScrollToSection('nosotros')}
                className="text-left text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-800"
              >
                📖 Nosotros
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Floating Cart Button - Mobile Only */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <div className="relative">
          <CartButton className="shadow-2xl" />
        </div>
      </div>
    </>
  );
}
