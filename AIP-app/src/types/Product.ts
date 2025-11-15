export interface Product {
  product_id: number;
  created_at: string;
  product_name: string;
  description: string;
  short_description?: string;
  price: number;
  is_sale?: boolean;
  sales_price?: number;
  stock_quantity: number;
  is_in_stock: boolean;
  low_stock_threshold?: number;
  Size: string;
  images?: string[]; // Array of Cloudinary URLs for images/videos
  colors?: string; // String of color data in format {color_data{color_code:...,color_name:...}},...
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

