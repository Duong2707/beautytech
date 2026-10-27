import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import api from '../../data/datasources/remote/api';
import { useAuth } from './AuthContext'; 

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

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]); 
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoadingCart(true);
      const res = await api.get('/api/cart');
      if (res.data.success) {
        setCart(res.data.data.items || []);
      }
    } catch (error: any) {
      console.log('Lỗi tải giỏ hàng:', error);
    } finally {
      setLoadingCart(false);
    }
  };

  const addToCart = async (product: any, quantity: number = 1, size: string = 'Mặc định') => {
    if (!user) {
      Alert.alert('Yêu cầu', 'Vui lòng đăng nhập để thêm vào giỏ hàng!');
      return;
    }
    try {
      const res = await api.post('/api/cart/add', {
        productId: product._id || product.id,
        quantity,
        size
      });
      if (res.data.success) {
        setCart(res.data.data.items);
        Alert.alert("Thành công", `Đã thêm ${quantity} ${product.name} vào giỏ hàng.`);
      }
    } catch (error: any) {
      console.log('Lỗi thêm vào giỏ:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await api.delete(`/api/cart/remove/${itemId}`);
      if (res.data.success) setCart(res.data.data.items);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể xóa sản phẩm này!');
    }
  };

  const removeSelectedFromCart = async () => {
    const selectedItems = cart.filter(item => item.selected);
    for (const item of selectedItems) {
      await removeFromCart(item._id);
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/api/cart/clear');
      if (res.data.success) setCart([]);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể xóa sạch giỏ hàng!');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const res = await api.put('/api/cart/update', { itemId, quantity });
      if (res.data.success) setCart(res.data.data.items);
    } catch (error) {
      console.log('Lỗi cập nhật số lượng:', error);
    }
  };

  const toggleSelect = async (itemId: string) => {
    const item = cart.find(i => i._id === itemId);
    if (!item) return;
    try {
      const res = await api.put('/api/cart/update', { itemId, selected: !item.selected });
      if (res.data.success) setCart(res.data.data.items);
    } catch (error) {
      console.log('Lỗi tick chọn:', error);
    }
  };

  const toggleSelectAll = async (selected: boolean) => {
    for (const item of cart) {
      if (item.selected !== selected) {
        await api.put('/api/cart/update', { itemId: item._id, selected });
      }
    }
    fetchCart(); 
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