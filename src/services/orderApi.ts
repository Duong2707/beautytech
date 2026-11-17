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
    // 👇 1. Kiểm tra Token trước khi gọi API để tránh lỗi 401 khi chưa đăng nhập
    const token = await AsyncStorage.getItem('@token');
    if (!token) {
      console.log('[orderApi] Chưa có Token, không gọi API lấy đơn hàng.');
      const cached = await AsyncStorage.getItem(CACHE_KEY_ORDERS);
      return { success: true, data: cached ? JSON.parse(cached) : [] };
    }

    const res = await api.get('/api/orders');
    
    // Khi có mạng và lấy thành công, cập nhật lại Cache
    await AsyncStorage.setItem(CACHE_KEY_ORDERS, JSON.stringify(res.data.data || res.data));
    return res.data;
  } catch (error: any) {
    // 🌟 PHÂN BIỆT LỖI MẠNG VÀ LỖI SERVER
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.log('[orderApi] Mất mạng thực sự, đang dùng cache đơn hàng...');
      const cached = await AsyncStorage.getItem(CACHE_KEY_ORDERS);
      return { success: true, data: cached ? JSON.parse(cached) : [] };
    } 
    // 👇 2. Xử lý lỗi 401 (Token hết hạn hoặc không hợp lệ)
    else if (error.response?.status === 401) {
      console.log('⚠️ [orderApi] Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
      // Xóa token cũ để buộc người dùng đăng nhập lại
      await AsyncStorage.removeItem('@token');
      return { success: false, data: [] };
    } 
    // 👇 3. Các lỗi Server khác (500, 404...)
    else {
      console.error('❌ [orderApi] Lỗi từ Server:', error.response?.status, error.response?.data);
      return { success: false, data: [] }; 
    }
  }
};

// Cập nhật trạng thái đơn hàng (Admin)
export const updateOrderStatusApi = async (orderId: string, status: string) => {
  try {
    const res = await api.put(`/api/orders/${orderId}/status`, { status });
    return res.data;
  } catch (error: any) {
    console.error('Lỗi updateOrderStatusApi:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Lỗi cập nhật trạng thái");
  }
};

// Gửi đánh giá
export const submitReviewApi = async (orderId: string, rating: number, comment: string) => {
  try {
    const res = await api.put(`/api/orders/${orderId}/review`, { rating, comment });
    return res.data;
  } catch (error: any) {
    console.error('Lỗi submitReviewApi:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Lỗi gửi đánh giá");
  }
};

// Hủy đơn hàng (Khách hàng)
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
    
    // Các lỗi khác (ví dụ: Server báo không thể hủy vì đơn đã giao)
    console.error('Lỗi cancelOrderApi:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Lỗi hủy đơn hàng");
  }
};