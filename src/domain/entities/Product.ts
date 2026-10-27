export interface Product {
  id: string;
  _id?: string; // Thêm _id từ MongoDB trả về
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  sizes?: string[]; // Thêm mảng kích thước
  skinTypes?: string[];
  concerns?: string[];
  stock?: number;
  rating: number; // Thêm đánh giá
  sold: number; // Thêm số lượng đã bán
}