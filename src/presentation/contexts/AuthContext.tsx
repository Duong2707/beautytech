import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../data/datasources/remote/api';

type AuthContextType = {
  user: any;
  loading: boolean;
  // 🌟 SỬA TẠI ĐÂY: Thêm isAdminMode (không bắt buộc)
  login: (email: string, password: string, isAdminMode?: boolean) => Promise<any>;
  register: (email: string, password: string, fullName?: string, phone?: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (data: any) => void;
  setAuthData: (userData: any, token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tự động load lại thông tin user khi mở app
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log("Lỗi load user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // 🌟 SỬA TẠI ĐÂY: Nhận thêm isAdminMode và truyền xuống API
  const login = async (email: string, password: string, isAdminMode: boolean = false) => {
    const res = await api.post('/api/auth/login', { 
      email, 
      password, 
      isAdminMode // 👈 Gửi cờ này xuống Backend
    });
    
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      await AsyncStorage.setItem('@token', userData.token);
    }
    return res.data;
  };

  // Hàm đăng ký (Giữ nguyên)
  const register = async (email: string, password: string, fullName?: string, phone?: string) => {
    const res = await api.post('/api/auth/register', { 
      email, 
      password, 
      fullName, 
      phone 
    });
    
    if (res.data.success) {
      const userData = res.data.data;
      setUser(userData);
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      await AsyncStorage.setItem('@token', userData.token);
    }
    return res.data;
  };

  // Hàm dùng cho Đăng nhập Google (Firebase)
  const setAuthData = async (userData: any, token: string) => {
    setUser(userData);
    await AsyncStorage.setItem('@user', JSON.stringify(userData));
    await AsyncStorage.setItem('@token', token);
  };

  // Hàm đăng xuất
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@user');
    await AsyncStorage.removeItem('@token');
  };

  // Hàm cập nhật thông tin user (dùng cho Edit Profile)
  const updateUser = async (data: any) => {
    const newUser = { ...user, ...data };
    setUser(newUser);
    await AsyncStorage.setItem('@user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};