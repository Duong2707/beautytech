import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../../domain/entities/User';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';
import { LoginUseCase } from '../../domain/usecases/auth/LoginUseCase';
import { RegisterUseCase } from '../../domain/usecases/auth/RegisterUseCase';
import { LogoutUseCase } from '../../domain/usecases/auth/LogoutUseCase';
import { storage } from '../../data/datasources/local/storage';

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
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthData: (user: User, token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Khởi tạo dependency
const authRepo = new AuthRepositoryImpl();
const loginUseCase = new LoginUseCase(authRepo);
const registerUseCase = new RegisterUseCase(authRepo);
const logoutUseCase = new LogoutUseCase(authRepo);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await authRepo.getToken();
        const savedUser = await authRepo.getCurrentUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
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
    const result = await loginUseCase.execute(email, password);
    await storage.setItem('token', result.token);
    await storage.setItem('user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => {
    const result = await registerUseCase.execute(email, password, fullName, phone);
    await storage.setItem('token', result.token);
    await storage.setItem('user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  };

  const loginWithGoogle = async (idToken: string) => {
    const result = await authRepo.loginWithGoogle(idToken);
    await storage.setItem('token', result.token);
    await storage.setItem('user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  };

  const logout = async () => {
    await logoutUseCase.execute();
    setToken(null);
    setUser(null);
  };

  const setAuthData = async (newUser: User, newToken: string) => {
    await storage.setItem('token', newToken);
    await storage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        setAuthData,
      }}
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