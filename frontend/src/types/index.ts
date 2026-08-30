export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
}

export interface PizzaOption {
  name: string;
  price: number;
  inStock: boolean;
  imageUrl?: string;
}

export interface PizzaOptions {
  bases: PizzaOption[];
  sauces: PizzaOption[];
  cheeses: PizzaOption[];
  vegetables: PizzaOption[];
}

export interface OrderItem {
  base: string;
  sauce: string;
  cheese: string;
  vegetables: string[];
  price: number;
  quantity?: number;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalPrice: number;
  paymentId?: string;
  status: 'Order Received' | 'In Kitchen' | 'Sent to Delivery' | 'Delivered';
  createdAt: string;
  updatedAt: string;
  txRef?: string;
}

export interface InventoryItem {
  _id: string;
  item: string;
  category: 'base' | 'sauce' | 'cheese' | 'vegetable';
  quantity: number;
  threshold: number;
  price: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartState {
  base: PizzaOption | null;
  sauce: PizzaOption | null;
  cheese: PizzaOption | null;
  vegetables: PizzaOption[];
  currentStep: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
