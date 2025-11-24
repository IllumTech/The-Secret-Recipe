'use client';

import { useState } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import { mockProducts } from '@/lib/mock-data';
import { Product } from '@/lib/types';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = selectedCategory === 'all'
    ? mockProducts
    : mockProducts.filter(p => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    alert(`${product.name} agregado al carrito`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container-custom py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6 space-x-4 text-6xl md:text-7xl animate-bounce-slow">
              <span>🍦</span>
              <span>🍰</span>
              <span>🧁</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display animate-slide-up">
              Bienvenido a<br />
              <span className="text-secondary-300">The Secret Recipe</span>
            </h1>
            
            <p className="text-xl md:text-3xl mb-4 font-medium animate-slide-up opacity-95">
              Los mejores helados y postres artesanales
            </p>
            
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto animate-slide-up">
              Descubre nuestros deliciosos productos hechos con amor, pasión y los ingredientes más premium del mundo
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <button 
                onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-primary-600 hover:bg-gray-50 font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
              >
                Ver Productos 🎉
              </button>
              <button className="bg-primary-700/50 backdrop-blur-sm hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-full border-2 border-white/30 hover:border-white/50 transition-all duration-200 text-lg">
                Sobre Nosotros 📖
              </button>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2 font-display">Ingredientes Premium</h3>
            <p className="text-gray-600">Solo usamos los mejores ingredientes naturales</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2 font-display">Hecho a Mano</h3>
            <p className="text-gray-600">Cada producto es una obra de arte artesanal</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🚚</div>
            <h3 className="text-xl font-bold mb-2 font-display">Entrega Rápida</h3>
            <p className="text-gray-600">Llevamos la felicidad directo a tu puerta</p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="productos" className="container-custom py-16">
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
        <ProductGrid
          products={filteredProducts}
          onAddToCart={handleAddToCart}
        />
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-accent-500 to-primary-600 text-white py-20 my-16">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display">
            ¿Listo para endulzar tu día?
          </h2>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            Únete a miles de clientes satisfechos que ya disfrutan de nuestros productos
          </p>
          <button className="bg-white text-primary-600 hover:bg-gray-50 font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 text-lg">
            Hacer mi Pedido Ahora 🎉
          </button>
        </div>
      </section>
    </div>
  );
}
