import React, { createContext, useState, useContext, ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  image: string;
  quantity: number;
  selected: boolean;
  size?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number, size?: string) => void;
  removeFromCart: (id: string) => void;
  removeSelectedFromCart: () => void;
  clearCart: () => void; // Hàm mới xóa sạch
  updateQuantity: (id: string, quantity: number) => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (selected: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: any, quantity: number = 1, size: string = '') => {
    setCart((prev) => {
      const itemId = `${product.id || product.name}-${size}`;
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, id: itemId, quantity, selected: true, size }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const removeSelectedFromCart = () => {
    setCart((prev) => prev.filter((item) => !item.selected));
  };

  const clearCart = () => setCart([]);

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const toggleSelect = (id: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleSelectAll = (selected: boolean) => {
    setCart((prev) => prev.map((item) => ({ ...item, selected })));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, removeSelectedFromCart, clearCart, updateQuantity, toggleSelect, toggleSelectAll }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};