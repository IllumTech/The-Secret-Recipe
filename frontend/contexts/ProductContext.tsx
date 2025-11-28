'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/lib/types';
import { mockProducts } from '@/lib/mock-data';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, ...productData, updatedAt: new Date().toISOString() }
        : p
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, isActive: false } : p
    ));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
