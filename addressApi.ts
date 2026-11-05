// src/services/addressApi.ts
// src/services/addressApi.ts (Sửa lại import nếu để ở thư mục gốc)
import api from './src/data/datasources/remote/api';

// Lưu ý: Token đã được tự động gắn qua interceptor của api.ts
// Tham số _token được giữ lại (không bắt buộc) để không làm lỗi các chỗ đang gọi hàm cũ.

export const fetchAddresses = async (_token?: string) => {
  try {
    const res = await api.get('/api/addresses');
    return res.data;
  } catch (error: any) {
    console.log('[addressApi] Lỗi tải địa chỉ:', error?.response?.status || error?.message);
    throw new Error('Lỗi khi tải địa chỉ');
  }
};

export const createAddress = async (_token: string | undefined, data: any) => {
  try {
    const res = await api.post('/api/addresses', data);
    return res.data;
  } catch (error: any) {
    console.log('[addressApi] Lỗi thêm địa chỉ:', error?.response?.status || error?.message);
    throw new Error('Lỗi khi thêm địa chỉ');
  }
};

export const updateAddress = async (_token: string | undefined, id: string, data: any) => {
  try {
    const res = await api.put(`/api/addresses/${id}`, data);
    return res.data;
  } catch (error: any) {
    console.log('[addressApi] Lỗi sửa địa chỉ:', error?.response?.status || error?.message);
    throw new Error('Lỗi khi sửa địa chỉ');
  }
};

export const deleteAddress = async (_token: string | undefined, id: string) => {
  try {
    const res = await api.delete(`/api/addresses/${id}`);
    return res.data;
  } catch (error: any) {
    console.log('[addressApi] Lỗi xóa địa chỉ:', error?.response?.status || error?.message);
    throw new Error('Lỗi khi xóa địa chỉ');
  }
};