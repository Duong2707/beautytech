// src/data/repositories/ProductRepositoryImpl.ts
import { sqliteStorage as AsyncStorage } from '../../data/datasources/local/sqliteStorage'; 
import api from '../datasources/remote/api';

const CACHE_KEY = '@cached_products';

export class ProductRepositoryImpl {
  // Lấy tất cả sản phẩm
  async getAll() {
    try {
      const res = await api.get('/api/products');
      const data = res.data.data || res.data;
      
      // 🌟 Lưu Cache khi lấy thành công
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      return data;
    } catch (error: any) {
      console.log("Lỗi lấy danh sách sản phẩm (Có thể do mất mạng):", error.message);
      
      // 🌟 Lấy từ Cache khi mất mạng
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    }
  }

  // Lấy 1 sản phẩm theo ID
  async getById(id: string) {
    try {
      // Gọi API lấy toàn bộ sản phẩm (hàm getAll đã có xử lý Cache)
      const products = await this.getAll();
      return products.find((p: any) => p._id === id) || null;
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
      return null;
    }
  }
}