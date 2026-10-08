export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  description: string;
  material: string;
  specifications: string;
  care: string;
  colors: string[];
  sizes: string[];
  isNew?: boolean;
  isSale?: boolean;
}

export interface CartItem {
  id: string; // unique item id (composite of product.id + selected color + selected size)
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
  area: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  customerName: string;
  status: 'Pending Verification' | 'Processing' | 'Shipped' | 'Delivered';
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  comment: string;
  verified: boolean;
  productName: string;
}
