import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { toggleWishlistApi } from '../../services/wishlistApi';
import { useAuth } from './AuthContext';

const WishlistContext = createContext<any>(null);

export const WishlistProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const loadLocal = async () => {
      try {
        const local = await AsyncStorage.getItem('@wishlist');
        if (local) {
          const parsed = JSON.parse(local);
          // Đảm bảo dữ liệu load lên luôn là mảng string sạch sẽ
          if (Array.isArray(parsed)) {
            setWishlistIds(parsed.filter(id => typeof id === 'string'));
          }
        }
      } catch (e) {
        console.log("Lỗi đọc bộ nhớ wishlist");
      }
    };
    loadLocal();
  }, []);

  const toggleWishlist = async (productId: string) => {
    setWishlistIds((prevIds) => {
      const isCurrentlyWishlisted = prevIds.includes(productId);
      const newIds = isCurrentlyWishlisted 
        ? prevIds.filter(id => id !== productId) 
        : [...prevIds, productId];
      
      AsyncStorage.setItem('@wishlist', JSON.stringify(newIds));
      
      if (user) {
        toggleWishlistApi(user.token || 'fake_token', productId);
      }
      
      return newIds;
    });
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);