// src/services/notificationApi.ts
import api from '../data/datasources/remote/api';

export const fetchNotifications = async () => {
  try {
    // 👇 Dùng api.get thay vì fetch(API_URL)
    const res = await api.get('/api/notifications');
    return res.data;
  } catch (error) {
    console.error("Lỗi kết nối API thông báo:", error);
    return []; 
  }
};

export const markNotificationReadApi = async (id: string) => {
  try {
    // 👇 Dùng api.put thay vì fetch
    await api.put(`/api/notifications/${id}/read`);
  } catch (error) {
    console.error("Lỗi khi đánh dấu đã đọc:", error);
  }
};