'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProductForm from '@/components/products/ProductForm';
import { Product } from '@/lib/types';
import { mockProducts } from '@/lib/mock-data';
import Loading from '@/components/ui/Loading';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);

  useEffect(() => {
    // TODO: Cargar producto desde la API
    const foundProduct = mockProducts.find(p => p.id === params.id);
    setProduct(foundProduct || null);
    setIsLoadingProduct(false);
  }, [params.id]);

  const handleSubmit = async (data: Partial<Product>) => {
    setIsLoading(true);
    
    try {
      // TODO: Llamar a la API para actualizar el producto
      console.log('Updating product:', params.id, data);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir a la lista de productos
      router.push('/admin/productos');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error al actualizar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link 
          href="/admin/productos"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Productos
        </Link>
        
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Producto no encontrado</h2>
          <p className="text-slate-600 mb-6">El producto que buscas no existe</p>
          <Link href="/admin/productos">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              Ver todos los productos
            </button>
          </Link>
        </div>
      </div>
    );
  }

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
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Editar Producto</h1>
        <p className="text-slate-600">Actualiza la información del producto</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
        <ProductForm 
          product={product} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
}
