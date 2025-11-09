export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string[];
  color: string[];
  imageUrl: string;
  stock: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

