import api from './api';

export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    _id: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    token: string;
  };
};

export const authService = {
  // Đăng ký
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  // Đăng nhập
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  // Lấy thông tin user hiện tại
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Quên mật khẩu - gửi OTP
  forgotPassword: async (email: string) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  // Xác thực OTP
  verifyOtp: async (email: string, otp: string) => {
    const response = await api.post('/api/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Đặt lại mật khẩu
  resetPassword: async (email: string, newPassword: string) => {
    const response = await api.post('/api/auth/reset-password', {
      email,
      newPassword,
    });
    return response.data;
  },
};