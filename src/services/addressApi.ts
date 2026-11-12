// src/services/addressApi.ts
import { sqliteStorage as AsyncStorage } from '../data/datasources/local/sqliteStorage'; 
import api from '../data/datasources/remote/api';
import { addToOfflineQueue } from './offlineSync';

const CACHE_KEY_ADDRESSES = '@cached_addresses';

export const fetchAddresses = async () => {
  try {
    const res = await api.get('/api/addresses');
    const data = res.data.data || res.data;
    
    // Lưu Cache khi có mạng
    await AsyncStorage.setItem(CACHE_KEY_ADDRESSES, JSON.stringify(data));
    return data;
  } catch (error: any) {
    console.log('[addressApi] Lỗi mạng, đang dùng cache địa chỉ...');
    // Mất mạng -> Lấy từ Cache
    const cached = await AsyncStorage.getItem(CACHE_KEY_ADDRESSES);
    return cached ? JSON.parse(cached) : [];
  }
};

export const createAddress = async (data: any) => {
  try {
    const res = await api.post('/api/addresses', data);
    return res.data;
  } catch (error: any) {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      await addToOfflineQueue('POST', '/api/addresses', data);
      
      // Cập nhật Cache với ID tạm
      const offlineAddress = { ...data, _id: 'offline_' + Date.now(), isOffline: true };
      const cached = await AsyncStorage.getItem(CACHE_KEY_ADDRESSES);
      const list = cached ? JSON.parse(cached) : [];
      await AsyncStorage.setItem(CACHE_KEY_ADDRESSES, JSON.stringify([offlineAddress, ...list]));
      
      return { success: true, isOffline: true, data: offlineAddress };
    }
    throw new Error('Lỗi khi thêm địa chỉ');
  }
};

export const updateAddress = async (id: string, data: any) => {
  try {
    const res = await api.put(`/api/addresses/${id}`, data);
    return res.data;
  } catch (error: any) {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      await addToOfflineQueue('PUT', `/api/addresses/${id}`, data);
      
      // Cập nhật Cache
      const cached = await AsyncStorage.getItem(CACHE_KEY_ADDRESSES);
      if (cached) {
        const list = JSON.parse(cached);
        const updatedList = list.map((a: any) => a._id === id ? { ...a, ...data } : a);
        await AsyncStorage.setItem(CACHE_KEY_ADDRESSES, JSON.stringify(updatedList));
      }
      
      return { success: true, isOffline: true };
    }
    throw new Error('Lỗi khi sửa địa chỉ');
  }
};

export const deleteAddress = async (id: string) => {
  try {
    const res = await api.delete(`/api/addresses/${id}`);
    return res.data;
  } catch (error: any) {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      await addToOfflineQueue('DELETE', `/api/addresses/${id}`, null);
      
      // Xóa khỏi Cache
      const cached = await AsyncStorage.getItem(CACHE_KEY_ADDRESSES);
      if (cached) {
        const list = JSON.parse(cached).filter((a: any) => a._id !== id);
        await AsyncStorage.setItem(CACHE_KEY_ADDRESSES, JSON.stringify(list));
      }
      
      return { success: true, isOffline: true };
    }
    throw new Error('Lỗi khi xóa địa chỉ');
  }
};