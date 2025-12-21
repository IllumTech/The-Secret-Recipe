'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/lib/types';
import { getDisplayPrice } from '@/lib/pricing';
import { useProducts } from './ProductContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  hasOutOfStockItems: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { products } = useProducts();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Sync cart items with latest product data
  useEffect(() => {
    if (products.length > 0 && items.length > 0) {
      setItems((currentItems) =>
        currentItems.map((item) => {
          const updatedProduct = products.find((p) => p.id === item.product.id);
          // If product found, update it with latest data, otherwise keep current
          return updatedProduct
            ? { ...item, product: updatedProduct }
            : item;
        })
      );
    }
  }, [products]);

  const addItem = (product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...currentItems, { product, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Only count items that have stock available
  const totalAmount = items.reduce((sum, item) => {
    const hasStock = item.product.stockQuantity === undefined || item.product.stockQuantity > 0;
    return hasStock ? sum + getDisplayPrice(item.product) * item.quantity : sum;
  }, 0);
  
  // Check if any item is out of stock
  const hasOutOfStockItems = items.some(item => 
    item.product.stockQuantity !== undefined && item.product.stockQuantity === 0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        hasOutOfStockItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
