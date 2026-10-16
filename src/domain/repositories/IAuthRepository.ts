import { User } from '../entities/User';

export type AuthResponse = {
  user: User;
  token: string;
};

export type LoginParams = {
  email: string;
  password: string;
};

export type RegisterParams = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
};

export interface IAuthRepository {
  login(params: LoginParams): Promise<AuthResponse>;
  register(params: RegisterParams): Promise<AuthResponse>;
  loginWithGoogle(idToken: string): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getToken(): Promise<string | null>;
}