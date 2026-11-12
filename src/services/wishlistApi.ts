import api from '../data/datasources/remote/api';
import { addToOfflineQueue } from './offlineSync';

export const toggleWishlistApi = async (productId: string) => {
  try {
    const res = await api.post('/api/wishlist/toggle', { productId });
    return res.data;
  } catch (error: any) {
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      await addToOfflineQueue('POST', '/api/wishlist/toggle', { productId });
      return { success: true, isOffline: true };
    }
    return { success: false };
  }
};