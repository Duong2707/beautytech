export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description?: string;
  skinTypes?: string[];
  rating?: number;
};