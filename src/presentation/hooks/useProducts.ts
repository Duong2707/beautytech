import { useState, useEffect } from 'react';
import api from '../../data/datasources/remote/api';

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Gọi thẳng API lấy sản phẩm từ MongoDB
        const res = await api.get('/api/products');
        
        // Tùy thuộc vào cấu trúc Backend trả về mà chọn dòng phù hợp:
        // Nếu Backend trả về { success: true, data: [...] } thì dùng res.data.data
        // Nếu trả về mảng trực tiếp [...] thì dùng res.data
        const data = res.data.data || res.data; 
        setProducts(data);
      } catch (err: any) {
        console.error("Lỗi tải sản phẩm:", err);
        setError(err.message || 'Lỗi kết nối API');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};