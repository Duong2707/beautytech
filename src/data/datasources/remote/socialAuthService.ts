import api from './api';

type LogtoLoginData = {
  email: string;
  fullName: string;
  avatar: string;
  logtoId: string;
};

export const socialAuthService = {
  // Đăng nhập qua Logto (Google/Facebook)
  logtoLogin: async (data: LogtoLoginData) => {
    const response = await api.post('/api/auth/logto', data);
    return response.data;
  },
};