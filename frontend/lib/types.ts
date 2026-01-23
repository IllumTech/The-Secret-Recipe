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
  // Business management fields
  productionCost?: number;
  stockQuantity?: number;
  minStockAlert?: number;
  leadTimeHours?: number;
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
  deliveryDate?: string;
  deliveryTime?: string;
  productionNotes?: string;
}

export interface WasteEntry {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'other';
  notes?: string;
  productionCost: number;
  financialImpact: number;
  timestamp: string;
  recordedBy?: string;
}

export interface WasteReport {
  month: number;
  year: number;
  totalWasteCost: number;
  wasteEntryCount: number;
  wasteByProduct: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalCost: number;
    entries: WasteEntry[];
  }>;
  startDate: string;
  endDate: string;
}

export interface CalendarOrder {
  date: string;
  orderCount: number;
  orders: Order[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    orderCount: number;
    orders: Order[];
  };
}

// Purchase types for the purchase invoices module
export type PurchaseCategory = 'ingredientes' | 'empaque' | 'decoracion' | 'equipo' | 'otros';

export interface Purchase {
  id: string;
  amount: number;
  purchaseDate: string;
  description: string;
  category: PurchaseCategory;
  receiptImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseInput {
  amount: number;
  purchaseDate: string;
  description: string;
  category: PurchaseCategory;
  receiptImageUrl?: string;
}

export interface UpdatePurchaseInput {
  amount?: number;
  purchaseDate?: string;
  description?: string;
  category?: PurchaseCategory;
  receiptImageUrl?: string;
}

export interface PurchaseFilters {
  startDate?: string;
  endDate?: string;
  category?: PurchaseCategory;
}

export interface PurchaseReport {
  month: number;
  year: number;
  totalAmount: number;
  purchaseCount: number;
  byCategory: Array<{
    category: PurchaseCategory;
    totalAmount: number;
    count: number;
  }>;
  startDate: string;
  endDate: string;
}
