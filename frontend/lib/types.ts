export interface Product {
  id: string;
  name: string;
  category: 'helado' | 'postre';
  price: number;
  description?: string;
  image?: string;
  imageUrl?: string;
  isActive: boolean;
  isOnPromotion: boolean;
  promotionalPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}
