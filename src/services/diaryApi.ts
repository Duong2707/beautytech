// src/services/diaryApi.ts
import { sqliteStorage as AsyncStorage } from '../data/datasources/local/sqliteStorage'; 
import api from '../data/datasources/remote/api';
import { addToOfflineQueue } from './offlineSync';

const CACHE_KEY = '@cached_diaries';

// 1. Lấy danh sách (Đã bắt gọn lỗi mạng, không throw ra ngoài)
export const fetchDiariesApi = async () => {
  try {
    const res = await api.get('/api/skin-diary');
    const data = res.data.data || res.data;
    
    // Lưu Cache khi có mạng
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return { success: true, data };
  } catch (error: any) {
    // 🌟 BẮT LỖI MẠNG TẠI ĐÂY
    console.log('[diaryApi] Lỗi mạng, đang dùng cache nhật ký...');
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    // Trả về data từ Cache thay vì throw lỗi
    return { success: true, data: cached ? JSON.parse(cached) : [] };
  }
};

// 2. Tạo mới (Có Offline Queue)
export const createDiaryApi = async (data: any) => {
  try {
    const res = await api.post('/api/skin-diary', data);
    const newData = res.data.data || res.data;
    
    // Cập nhật Cache
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    const list = cached ? JSON.parse(cached) : [];
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify([newData, ...list]));
    
    return res.data;
  } catch (error: any) {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      await addToOfflineQueue('POST', '/api/skin-diary', data);
      
      const tempId = 'offline_diary_' + Date.now();
      const newDiary = { ...data, _id: tempId, createdAt: new Date().toISOString() };
      
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      const list = cached ? JSON.parse(cached) : [];
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify([newDiary, ...list]));
      
      return { success: true, isOffline: true, data: newDiary };
    }
    throw error;
  }
};

// 3. Xóa 1 bản ghi (Có Offline Queue)
export const deleteDiaryApi = async (id: string) => {
  try {
    const res = await api.delete(`/api/skin-diary/${id}`);
    
    // Xóa khỏi Cache
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const list = JSON.parse(cached).filter((item: any) => item._id !== id);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list));
    }
    return res.data;
  } catch (error: any) {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      await addToOfflineQueue('DELETE', `/api/skin-diary/${id}`, null);
      
      // Xóa khỏi Cache
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const list = JSON.parse(cached).filter((item: any) => item._id !== id);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list));
      }
      return { success: true, isOffline: true };
    }
    throw error;
  }
};

// 4. Xóa toàn bộ (Có Offline Queue)
export const clearDiaryApi = async () => {
  try {
    // 👇 SỬA TẠI ĐÂY: Thêm chữ '/clear' vào sau
    const res = await api.delete('/api/skin-diary/clear'); 
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify([])); 
    return res.data;
  } catch (error: any) {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      // 👇 SỬA TẠI ĐÂY: Đổi 'clear-all' thành 'clear' cho khớp Backend
      await addToOfflineQueue('DELETE', '/api/skin-diary/clear', null);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify([])); 
      return { success: true, isOffline: true };
    }
    throw error;
  }
};