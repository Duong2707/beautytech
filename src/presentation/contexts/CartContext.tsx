import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { sqliteStorage as AsyncStorage } from '../../data/datasources/local/sqliteStorage'; 
import api from '../../data/datasources/remote/api';
import { addToOfflineQueue } from '../../services/offlineSync';
import { useAuth } from './AuthContext'; 

const CACHE_KEY = '@cached_cart';

export type CartItem = {
  _id: string; 
  product: any;
  quantity: number;
  selected: boolean;
  size: string;
};

type CartContextType = {
  cart: CartItem[];
  loadingCart: boolean;
  addToCart: (product: any, quantity?: number, size?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  removeSelectedFromCart: () => Promise<void>;
  clearCart: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  toggleSelect: (itemId: string) => Promise<void>;
  toggleSelectAll: (selected: boolean) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const { user } = useAuth(); 

  // Hàm phụ trợ để cập nhật state và cache
  const updateCartState = async (newCart: CartItem[]) => {
    setCart(newCart);
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newCart));
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]); 
      AsyncStorage.removeItem(CACHE_KEY);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoadingCart(true);
      
      // 1. Lấy từ Cache hiển thị trước (Offline-First)
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) setCart(JSON.parse(cached));

      // 2. Gọi API để đồng bộ
      const res = await api.get('/api/cart');
      if (res.data.success) {
        const serverCart = res.data.data.items || [];
        updateCartState(serverCart);
      }
    } catch (error: any) {
      console.log('Lỗi tải giỏ hàng (Có thể đang offline):', error.message);
    } finally {
      setLoadingCart(false);
    }
  };

  const addToCart = async (product: any, quantity: number = 1, size: string = 'Mặc định') => {
    if (!user) {
      Alert.alert('Yêu cầu', 'Vui lòng đăng nhập để thêm vào giỏ hàng!');
      return;
    }

    // 1. Cập nhật giao diện ngay lập tức (Optimistic)
    const newCart = [...cart];
    const existingIndex = newCart.findIndex(
      i => (i.product._id === product._id || i.product.id === product.id) && i.size === size
    );

    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({
        _id: 'offline_cart_' + Date.now(), // ID tạm nếu offline
        product,
        quantity,
        selected: true,
        size
      });
    }
    await updateCartState(newCart);

    try {
      // 2. Gọi API đồng bộ
      const res = await api.post('/api/cart/add', {
        productId: product._id || product.id,
        quantity,
        size
      });
      if (res.data.success) {
        updateCartState(res.data.data.items); // Đồng bộ lại với data chuẩn từ Server
        Alert.alert("Thành công", `Đã thêm ${quantity} ${product.name} vào giỏ hàng.`);
      }
    } catch (error: any) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        // 3. Lỗi mạng -> Đưa vào hàng đợi
        await addToOfflineQueue('POST', '/api/cart/add', { productId: product._id || product.id, quantity, size });
        Alert.alert("Lưu ngoại tuyến", `Đã thêm ${quantity} ${product.name} vào giỏ (Sẽ đồng bộ khi có mạng).`);
      } else {
        Alert.alert('Lỗi', error.response?.data?.message || 'Không thể thêm vào giỏ hàng.');
        fetchCart(); // Revert lại nếu lỗi logic
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    // 1. Cập nhật giao diện ngay lập tức
    const newCart = cart.map(item => item._id === itemId ? { ...item, quantity } : item);
    await updateCartState(newCart);

    try {
      const res = await api.put('/api/cart/update', { itemId, quantity });
      if (res.data.success) updateCartState(res.data.data.items);
    } catch (error: any) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        await addToOfflineQueue('PUT', '/api/cart/update', { itemId, quantity });
      }
    }
  };

  const toggleSelect = async (itemId: string) => {
    const item = cart.find(i => i._id === itemId);
    if (!item) return;
    const newSelected = !item.selected;

    // 1. Cập nhật giao diện
    const newCart = cart.map(i => i._id === itemId ? { ...i, selected: newSelected } : i);
    await updateCartState(newCart);

    try {
      const res = await api.put('/api/cart/update', { itemId, selected: newSelected });
      if (res.data.success) updateCartState(res.data.data.items);
    } catch (error: any) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        await addToOfflineQueue('PUT', '/api/cart/update', { itemId, selected: newSelected });
      }
    }
  };

  const toggleSelectAll = async (selected: boolean) => {
    // 1. Cập nhật giao diện
    const newCart = cart.map(item => ({ ...item, selected }));
    await updateCartState(newCart);

    // 2. Gửi API cho từng món (nếu offline thì queue)
    for (const item of cart) {
      if (item.selected !== selected) {
        try {
          await api.put('/api/cart/update', { itemId: item._id, selected });
        } catch (error: any) {
          if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
            await addToOfflineQueue('PUT', '/api/cart/update', { itemId: item._id, selected });
          }
        }
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    // 1. Cập nhật giao diện
    const newCart = cart.filter(i => i._id !== itemId);
    await updateCartState(newCart);

    try {
      const res = await api.delete(`/api/cart/remove/${itemId}`);
      if (res.data.success) updateCartState(res.data.data.items);
    } catch (error: any) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        await addToOfflineQueue('DELETE', `/api/cart/remove/${itemId}`, null);
      } else {
        Alert.alert('Lỗi', 'Không thể xóa sản phẩm này!');
        fetchCart();
      }
    }
  };

  const clearCart = async () => {
    await updateCartState([]);

    try {
      const res = await api.delete('/api/cart/clear');
      if (res.data.success) updateCartState([]);
    } catch (error: any) {
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        await addToOfflineQueue('DELETE', '/api/cart/clear', null);
      }
    }
  };

  const removeSelectedFromCart = async () => {
    const selectedItems = cart.filter(item => item.selected);
    if (selectedItems.length === 0) return;

    // 1. Cập nhật giao diện
    const newCart = cart.filter(item => !item.selected);
    await updateCartState(newCart);

    // 2. Gọi API xóa từng món
    for (const item of selectedItems) {
      try {
        await api.delete(`/api/cart/remove/${item._id}`);
      } catch (error: any) {
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
          await addToOfflineQueue('DELETE', `/api/cart/remove/${item._id}`, null);
        }
      }
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, loadingCart, addToCart, removeFromCart, removeSelectedFromCart, 
      clearCart, updateQuantity, toggleSelect, toggleSelectAll 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};