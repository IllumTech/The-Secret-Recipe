'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProductForm from '@/components/products/ProductForm';
import { Product } from '@/lib/types';

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: Partial<Product>) => {
    setIsLoading(true);
    
    try {
      // TODO: Llamar a la API para crear el producto
      console.log('Creating product:', data);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir a la lista de productos
      router.push('/admin/productos');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear el producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <Link 
        href="/admin/productos"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Productos
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Crear Nuevo Producto</h1>
        <p className="text-slate-600">Agrega un nuevo producto a tu catálogo</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
