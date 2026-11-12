// src/presentation/hooks/useProducts.ts
import { useState, useEffect } from 'react';
import { sqliteStorage as AsyncStorage } from '../../data/datasources/local/sqliteStorage'; 
import NetInfo from '@react-native-community/netinfo';
import api from '../../data/datasources/remote/api';

const CACHE_KEY = '@cached_products';

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 1. BƯỚC 1: Lấy dữ liệu từ Cache lên trước (để hiện ngay lập tức)
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
          setProducts(JSON.parse(cachedData));
          setLoading(false); // Tắt loading sớm vì đã có dữ liệu cũ hiển thị
        }

        // 2. BƯỚC 2: Kiểm tra xem có mạng không
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
          // Nếu mất mạng và không có dữ liệu cũ -> Báo lỗi
          if (!cachedData) {
            setError('Không có kết nối mạng và chưa có dữ liệu sản phẩm.');
          }
          return;
        }

        // 3. BƯỚC 3: Có mạng -> Gọi API lấy dữ liệu mới nhất
        const res = await api.get('/api/products');
        const newData = res.data.data || res.data;
        
        setProducts(newData);
        setError('');
        
        // 4. BƯỚC 4: Lưu dữ liệu mới vào Cache cho lần sau
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newData));

      } catch (err: any) {
        console.log('Lỗi tải sản phẩm:', err);
        // Nếu lỗi API (500, 404...) mà không có cache thì mới báo lỗi
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (!cachedData) {
          setError('Không thể tải dữ liệu sản phẩm.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};