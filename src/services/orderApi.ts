// src/services/orderApi.ts
import { sqliteStorage as AsyncStorage } from '../data/datasources/local/sqliteStorage'; 
import api from '../data/datasources/remote/api';
import { addToOfflineQueue } from './offlineSync';

const CACHE_KEY_ORDERS = '@cached_orders';

export const createOrderApi = async (_token: string, orderData: any) => {
  try {
    const res = await api.post('/api/orders', orderData);
    return res.data;
  } catch (error: any) {
    // 🌟 Nếu mất mạng, lưu đơn hàng vào hàng đợi
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      await addToOfflineQueue('POST', '/api/orders', orderData);
      
      // 🌟 Lưu đơn hàng vào Cache để UI hiển thị ngay lập tức
      const offlineOrder = { 
        ...orderData, 
        _id: 'offline_' + Date.now(), 
        isOffline: true, 
        createdAt: new Date().toISOString() 
      };
      
      const cached = await AsyncStorage.getItem(CACHE_KEY_ORDERS);
      const list = cached ? JSON.parse(cached) : [];
      await AsyncStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify([offlineOrder, ...list]));
      
      return { success: true, isOffline: true, orderId: orderData.orderId };
    }

    return { success: false, orderId: orderData.orderId };
  }
};

export const fetchOrdersApi = async () => {
  try {
    // Lưu ý: Nếu Backend của bạn có route riêng cho Admin (ví dụ: /api/orders/admin) thì phải đổi URL ở đây nhé!
    const res = await api.get('/api/orders');
    
    // Khi có mạng, cập nhật lại Cache
    await AsyncStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify(res.data.data || res.data));
    return res.data;
  } catch (error: any) {
    // 🌟 PHÂN BIỆT LỖI MẠNG VÀ LỖI SERVER
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('[orderApi] Mất mạng thực sự, đang dùng cache đơn hàng...');
      const cached = await AsyncStorage.getItem(CACHE_KEY_ORDERS);
      return { success: true, data: cached ? JSON.parse(cached) : [] };
    } else {
      // 👇 IN RA LỖI THẬT TỪ SERVER (Để biết tại sao không lấy được data)
      console.error('❌ [orderApi] Lỗi từ Server:', error.response?.status, error.response?.data);
      
      // Trả về mảng rỗng nếu lỗi, tránh crash app
      return { success: false, data: [] }; 
    }
  }
};

// Các hàm update, review, cancel giữ nguyên...
export const updateOrderStatusApi = async (orderId: string, status: string) => {
  try {
    const res = await api.put(`/api/orders/${orderId}/status`, { status });
    return res.data;
  } catch (error: any) {
    throw new Error("Lỗi cập nhật trạng thái");
  }
};

export const submitReviewApi = async (orderId: string, rating: number, comment: string) => {
  try {
    const res = await api.put(`/api/orders/${orderId}/review`, { rating, comment });
    return res.data;
  } catch (error: any) {
    throw new Error("Lỗi gửi đánh giá");
  }
};

export const cancelOrderApi = async (orderId: string) => {
  try {
    const res = await api.put(`/api/orders/${orderId}/cancel`);
    return res.data;
  } catch (error: any) {
    // 🌟 NẾU MẤT MẠNG
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      // 1. Đưa vào hàng đợi
      await addToOfflineQueue('PUT', `/api/orders/${orderId}/cancel`, null);
      
      // 2. Cập nhật Cache trên máy để UI thấy trạng thái "Đã hủy"
      const cached = await AsyncStorage.getItem(CACHE_KEY_ORDERS);
      if (cached) {
        const list = JSON.parse(cached);
        const updatedList = list.map((o: any) => 
          (o.orderId === orderId || o._id === orderId) ? { ...o, orderStatus: 'cancelled' } : o
        );
        await AsyncStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify(updatedList));
      }
      
      return { success: true, isOffline: true };
    }
    throw new Error("Lỗi hủy đơn hàng");
  }
};