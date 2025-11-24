import Image from 'next/image';
import { Product } from '@/lib/types';
import Button from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const categoryEmoji = product.category === 'helado' ? '🍦' : '🍰';
  
  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };
  
  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in">
      <div 
        onClick={handleClick}
        className="cursor-pointer"
      >
        <div className="relative h-56 w-full bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl">
              {categoryEmoji}
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-semibold text-primary-600 capitalize">
              {categoryEmoji} {product.category}
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div 
          onClick={handleClick}
          className="cursor-pointer"
        >
          <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 min-h-[3.5rem] font-display">
            {product.name}
          </h3>
        </div>
        
        {product.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
          </div>
          
          {onAddToCart && (
            <Button
              onClick={() => onAddToCart(product)}
              className="text-sm px-4 py-2"
            >
              <span className="flex items-center space-x-1">
                <span>Agregar</span>
                <span>🛒</span>
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
