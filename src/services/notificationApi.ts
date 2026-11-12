// src/services/notificationApi.ts
import { sqliteStorage as AsyncStorage } from '../data/datasources/local/sqliteStorage'; 
import api from '../data/datasources/remote/api';
import { addToOfflineQueue } from './offlineSync';

const CACHE_KEY = '@cached_notifications';

// 1. Lấy danh sách thông báo (Hỗ trợ Cache Offline)
export const fetchNotifications = async () => {
  try {
    const res = await api.get('/api/notifications');
    const data = res.data.data || res.data;
    
    // Lưu Cache lại để dùng khi mất mạng
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  } catch (error: any) {
    console.log('[notificationApi] Lỗi mạng, đang dùng cache thông báo...');
    // Nếu lỗi mạng, lấy dữ liệu cũ từ Cache ra
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
};

// 2. Đánh dấu đã đọc (Hỗ trợ Offline Queue)
export const markNotificationReadApi = async (id: string) => {
  try {
    const res = await api.put(`/api/notifications/${id}/read`);
    return res.data;
  } catch (error: any) {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      // Lưu vào hàng đợi để khi có mạng thì gửi lên Server
      await addToOfflineQueue('PUT', `/api/notifications/${id}/read`, {});
      return { success: true, isOffline: true };
    }
    throw error;
  }
};