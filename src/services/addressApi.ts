// src/services/addressApi.ts
import api from '../data/datasources/remote/api'; 

export const fetchAddresses = async () => {
  try {
    const res = await api.get('/api/addresses');
    return res.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách địa chỉ:", error);
    return [];
  }
};

// 👇 Đổi tên thành createAddress
export const createAddress = async (data: any) => {
  const res = await api.post('/api/addresses', data);
  return res.data;
};

export const updateAddress = async (id: string, data: any) => {
  const res = await api.put(`/api/addresses/${id}`, data);
  return res.data;
};

export const deleteAddress = async (id: string) => {
  const res = await api.delete(`/api/addresses/${id}`);
  return res.data;
};