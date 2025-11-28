'use client';

import { createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';
import { Product } from '@/lib/types';
import * as api from '@/lib/api';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: any;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => Promise<Product>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const { data: products = [], error, isLoading, mutate } = useSWR<Product[]>(
    'products',
    api.getProducts,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
    const newProduct = await api.createProduct(productData);
    mutate(); // Refresh products list
    return newProduct;
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const updatedProduct = await api.updateProduct(id, productData);
    mutate(); // Refresh products list
    return updatedProduct;
  };

  const deleteProduct = async (id: string) => {
    await api.deleteProduct(id);
    mutate(); // Refresh products list
  };

  const refreshProducts = () => {
    mutate();
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      isLoading, 
      error, 
      addProduct, 
      updateProduct, 
      deleteProduct,
      refreshProducts 
    }}>
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
