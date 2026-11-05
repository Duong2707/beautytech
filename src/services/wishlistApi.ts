// src/services/wishlistApi.ts
import api from '../data/datasources/remote/api';

export const toggleWishlistApi = async (_token: string, productId: string) => {
  try {
    const res = await api.post('/api/wishlist/toggle', { productId });
    return res.data;
  } catch (error: any) {
    console.log(
      '[wishlistApi] Lỗi:',
      error?.response?.status || error?.message,
      '→ UI vẫn được lưu local (Context xử lý).'
    );
    return { success: false };
  }
};