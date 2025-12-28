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
    const apiError: any = new Error(error.error || `HTTP error! status: ${response.status}`);
    apiError.response = {
      status: response.status,
      data: error
    };
    throw apiError;
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

export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  const orders = await getOrders();
  const order = orders.find(o => o.orderNumber === orderNumber);
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
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
  deliveryDate?: string;
  deliveryTime?: string;
  productionNotes?: string;
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

// Upload Image API
export async function uploadImage(file: File): Promise<{ imageUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const result = await apiCall<{ imageUrl: string }>('/upload', {
          method: 'POST',
          body: JSON.stringify({
            image: base64,
            fileName: file.name,
            contentType: file.type,
          }),
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Waste Management API
export async function createWasteEntry(data: {
  productId: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'other';
  notes?: string;
  timestamp: string;
}): Promise<import('./types').WasteEntry> {
  return apiCall<import('./types').WasteEntry>('/waste', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getWasteEntries(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<import('./types').WasteEntry[]> {
  const queryString = params 
    ? '?' + new URLSearchParams(params as Record<string, string>).toString()
    : '';
  return apiCall<import('./types').WasteEntry[]>(`/waste${queryString}`);
}

export async function getWasteReport(params?: {
  month?: number;
  year?: number;
}): Promise<import('./types').WasteReport> {
  const queryString = params 
    ? '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {} as Record<string, string>)
      ).toString()
    : '';
  return apiCall<import('./types').WasteReport>(`/waste/report${queryString}`);
}

// Production Calendar API
export async function getCalendarOrders(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  dates: string[];
  ordersByDate: { [date: string]: Order[] };
  orderCounts: { [date: string]: number };
  totalOrders: number;
}> {
  const queryString = params 
    ? '?' + new URLSearchParams(params as Record<string, string>).toString()
    : '';
  return apiCall(`/calendar/orders${queryString}`);
}

export async function getOrdersByDate(date: string): Promise<{
  date: string;
  orders: Order[];
  count: number;
}> {
  return apiCall(`/calendar/orders/${date}`);
}

// Business Analytics API
export async function getDemandForecast(): Promise<{
  forecast: Array<{
    product: string;
    day: string;
    quantity: number;
  }>;
}> {
  return apiCall('/analytics/demand-forecast', {
    method: 'POST',
  });
}

export async function getPriceRecommendations(): Promise<{
  recommendations: Array<{
    product: string;
    currentPrice: number;
    suggestedPrice: number;
    reason: string;
  }>;
}> {
  return apiCall('/analytics/price-recommendations', {
    method: 'POST',
  });
}
