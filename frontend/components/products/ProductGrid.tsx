import { Product } from '@/lib/types';
import ProductCard from './ProductCard';
import Loading from '@/components/ui/Loading';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onProductClick?: (product: Product) => void;
}

export default function ProductGrid({ products, isLoading, onProductClick }: ProductGridProps) {
  if (isLoading) {
    return <Loading />;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in-up"
          style={{
            animationDelay: `${index * 80}ms`,
            animationFillMode: 'both'
          }}
        >
          <ProductCard 
            product={product}
            onProductClick={onProductClick}
          />
        </div>
      ))}
    </div>
  );
}
