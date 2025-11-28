import { Product, Order } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Products API
export async function getProducts(): Promise<Product[]> {
  return apiCall<Product[]>('/products');
}

export async function getProduct(id: string): Promise<Product> {
  return apiCall<Product>(`/products/${id}`);
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return apiCall<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return apiCall<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<{ message: string }> {
  return apiCall<{ message: string }>(`/products/${id}`, {
    method: 'DELETE',
  });
}

// Orders API
export async function getOrders(): Promise<Order[]> {
  return apiCall<Order[]>('/orders');
}

export async function createOrder(data: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
}): Promise<Order> {
  return apiCall<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// AI Generator API
export async function generateProductContent(
  productName: string,
  category: string
): Promise<{ description: string; imageUrl: string }> {
  return apiCall<{ description: string; imageUrl: string }>('/ai/generate', {
    method: 'POST',
    body: JSON.stringify({ productName, category }),
  });
}
