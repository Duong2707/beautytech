import {
  IAuthRepository,
  AuthResponse,
  LoginParams,
  RegisterParams,
} from '../../domain/repositories/IAuthRepository';
import { authService } from '../datasources/remote/authService';
import { storage } from '../datasources/local/storage';
import { toUserDomain } from '../models/UserModel';
import api from '../datasources/remote/api';

export class AuthRepositoryImpl implements IAuthRepository {
  async login(params: LoginParams): Promise<AuthResponse> {
    const response = await authService.login({
      email: params.email,
      password: params.password,
    });

    const { token, ...userData } = response.data;

    return {
      user: toUserDomain({ ...userData, token } as any),
      token,
    };
  }

  async register(params: RegisterParams): Promise<AuthResponse> {
    const response = await authService.register({
      email: params.email,
      password: params.password,
      fullName: params.fullName,
      phone: params.phone,
    });

    const { token, ...userData } = response.data;

    return {
      user: toUserDomain({ ...userData, token } as any),
      token,
    };
  }

  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await api.post('/api/auth/firebase-login', { idToken });
    const { token, ...userData } = response.data.data;

    return {
      user: toUserDomain({ ...userData, token } as any),
      token,
    };
  }

  async logout(): Promise<void> {
    await storage.removeItem('token');
    await storage.removeItem('user');
  }

  async getCurrentUser() {
    const userJson = await storage.getItem('user');
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    return storage.getItem('token');
  }
}