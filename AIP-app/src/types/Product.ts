export interface Product {
  product_id: number;
  created_at: string;
  product_name: string;
  description: string;
  short_descrip?: string;
  price: number;
  is_sale?: boolean;
  sales_price?: number;
  stock_quantit: number;
  is_in_stock: boolean;
  low_stock_thr?: number;
  Size: string;
  images?: string[]; // Array of Cloudinary URLs for images/videos
  // Legacy fields for backward compatibility
  id?: string;
  name?: string;
  category?: string;
  size?: string[];
  color?: string[];
  imageUrl?: string;
  stock?: number;
  available?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

