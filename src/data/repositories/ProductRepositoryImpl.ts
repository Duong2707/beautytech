// src/data/repositories/ProductRepositoryImpl.ts
import api from '../datasources/remote/api';

export class ProductRepositoryImpl {
  // Lấy tất cả sản phẩm
  async getAll() {
    try {
      const res = await api.get('/api/products');
      return res.data.data || res.data;
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
      return [];
    }
  }

  // Lấy 1 sản phẩm theo ID
  async getById(id: string) {
    try {
      // Gọi API lấy toàn bộ sản phẩm rồi lọc theo ID
      // (Hoặc nếu Backend có API GET /api/products/:id thì bạn có thể gọi trực tiếp)
      const res = await api.get('/api/products');
      const products = res.data.data || res.data;
      return products.find((p: any) => p._id === id) || null;
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
      return null;
    }
  }
}