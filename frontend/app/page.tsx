'use client';

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import ProductDetail from '@/components/products/ProductDetail';
import Modal from '@/components/ui/Modal';
import { useProducts } from '@/contexts/ProductContext';
import { Product } from '@/lib/types';

export default function HomePage() {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState(products.filter(p => p.isActive));
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Escuchar eventos de cambio de categoría desde el Header
  useEffect(() => {
    const handleCategoryChange = (event: CustomEvent) => {
      setSelectedCategory(event.detail);
    };

    window.addEventListener('categoryChange', handleCategoryChange as EventListener);
    return () => {
      window.removeEventListener('categoryChange', handleCategoryChange as EventListener);
    };
  }, []);

  const activeProducts = products.filter(p => p.isActive);
  const filteredProducts = selectedCategory === 'promocion'
    ? activeProducts.filter(p => p.isOnPromotion)
    : selectedCategory === 'all'
    ? activeProducts
    : activeProducts.filter(p => p.category === selectedCategory);

  useEffect(() => {
    // Iniciar transición de salida
    setIsTransitioning(true);
    
    // Después de 400ms (fade out), actualizar productos
    const updateTimer = setTimeout(() => {
      setDisplayedProducts(filteredProducts);
    }, 400);

    // Después de 450ms, iniciar transición de entrada
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 450);

    return () => {
      clearTimeout(updateTimer);
      clearTimeout(transitionTimer);
    };
  }, [selectedCategory, products]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 text-white overflow-visible">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container-custom relative z-20 py-8 sm:py-12 md:py-16 lg:py-20 min-h-[450px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px] flex items-center">
          <div className="max-w-4xl mx-auto text-center w-full">
            {/* Emojis */}
            <div className="flex justify-center mb-3 sm:mb-4 space-x-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="animate-bounce-slow">🍦</span>
              <span className="animate-bounce-slow" style={{ animationDelay: '0.1s' }}>🍰</span>
              <span className="animate-bounce-slow" style={{ animationDelay: '0.2s' }}>🧁</span>
            </div>
            
            {/* Título Principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 font-display leading-tight">
              Bienvenido a<br />
              <span className="text-secondary-300">La Receta Secreta</span>
            </h1>
            
            {/* Subtítulo */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-2 sm:mb-3 font-semibold opacity-95">
              Los mejores helados y postres artesanales
            </p>
            
            {/* Descripción */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto px-4">
              Descubre nuestros deliciosos productos hechos con amor, pasión y los ingredientes más premium del mundo
            </p>
            
            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <button 
                onClick={() => {
                  const element = document.getElementById('productos');
                  if (element) {
                    const offset = 100;
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
                  }
                }}
                className="bg-white text-primary-600 hover:bg-gray-50 font-bold py-3 px-8 rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 text-base sm:text-lg"
              >
                Ver Productos 🎉
              </button>
              <button className="bg-primary-700/50 backdrop-blur-sm hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full border-2 border-white/30 hover:border-white/50 transition-all duration-200 text-base sm:text-lg">
                Sobre Nosotros 📖
              </button>
            </div>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0 -mb-px">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-2xl bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2 font-display">Ingredientes Premium</h3>
            <p className="text-gray-600">Solo usamos los mejores ingredientes naturales</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2 font-display">Hecho a Mano</h3>
            <p className="text-gray-600">Cada producto es una obra de arte artesanal</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🚚</div>
            <h3 className="text-xl font-bold mb-2 font-display">Entrega Rápida</h3>
            <p className="text-gray-600">Llevamos la felicidad directo a tu puerta</p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="productos" className="container-custom py-16 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
            Nuestros <span className="gradient-text">Productos</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explora nuestra deliciosa selección de helados cremosos y postres irresistibles
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>🎯</span>
              <span>Todos</span>
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory('promocion')}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
              selectedCategory === 'promocion'
                ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg animate-pulse'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>🔥</span>
              <span>Promociones</span>
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory('helado')}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
              selectedCategory === 'helado'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>🍦</span>
              <span>Helados</span>
            </span>
          </button>
          <button
            onClick={() => setSelectedCategory('postre')}
            className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 ${
              selectedCategory === 'postre'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>🍰</span>
              <span>Postres</span>
            </span>
          </button>
        </div>

        {/* Product Grid */}
        <div 
          className={`transition-all duration-700 ease-in-out ${
            isTransitioning 
              ? 'opacity-0 transform scale-95 blur-sm' 
              : 'opacity-100 transform scale-100 blur-0'
          }`}
        >
          {selectedCategory === 'promocion' && displayedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 animate-bounce">🔥</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No hay productos en promoción en este momento
              </h3>
              <p className="text-gray-600 text-lg">
                ¡Vuelve pronto para ver nuestras ofertas especiales!
              </p>
            </div>
          ) : (
            <ProductGrid 
              products={displayedProducts}
              onProductClick={(product) => {
                setSelectedProduct(product);
                setIsModalOpen(true);
              }}
            />
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct?.name || 'Detalle del Producto'}
      >
        {selectedProduct && (
          <ProductDetail product={selectedProduct} />
        )}
      </Modal>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-accent-500 to-primary-600 text-white py-20 mt-16 mb-0">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
            ¿Listo para endulzar tu día?
          </h2>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            Únete a miles de clientes satisfechos que ya disfrutan de nuestros productos
          </p>
          <button 
            onClick={() => {
              const element = document.getElementById('productos');
              if (element) {
                const offset = 100;
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
              }
            }}
            className="bg-white text-primary-600 hover:bg-gray-50 font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
          >
            Hacer mi Pedido Ahora 🎉
          </button>
        </div>
      </section>
    </div>
  );
}
