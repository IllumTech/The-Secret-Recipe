'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductDetail from '@/components/products/ProductDetail';
import { mockProducts } from '@/lib/mock-data';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container-custom py-8">
      <Link
        href="/"
        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        ← Volver al catálogo
      </Link>

      <ProductDetail product={product} />
    </div>
  );
}
