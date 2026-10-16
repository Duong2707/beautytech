import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../../data/datasources/remote/authService';
import { storage } from '../../data/datasources/local/storage';

type User = {
  _id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  setAuthData: (user: User, token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await storage.getItem('token');
        const savedUser = await storage.getItem('user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.log('Load token error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    const { token: newToken, ...userData } = response.data;

    await storage.setItem('token', newToken);
    await storage.setItem('user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => {
    const response = await authService.register({
      email,
      password,
      fullName,
      phone,
    });
    const { token: newToken, ...userData } = response.data;

    await storage.setItem('token', newToken);
    await storage.setItem('user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    await storage.removeItem('token');
    await storage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Method mới — dùng cho Google login
  const setAuthData = async (newUser: User, newToken: string) => {
    await storage.setItem('token', newToken);
    await storage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, setAuthData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải dùng trong AuthProvider');
  }
  return context;
}