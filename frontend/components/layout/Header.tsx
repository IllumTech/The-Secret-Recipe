'use client';

import Link from 'next/link';
import CartButton from '@/components/cart/CartButton';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Header() {
  const handleCategoryClick = (category: string) => {
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
  return (
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
              onClick={() => {
                const element = document.getElementById('nosotros');
                if (element) {
                  const offset = 100;
                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                  window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
                }
              }}
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
            >
              Nosotros
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
            </button>
          </nav>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
