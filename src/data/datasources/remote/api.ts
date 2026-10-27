import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from '../local/storage';

const BASE_URL = Platform.select({
  web: 'http://localhost:5000',
  android: 'http://10.0.2.2:5000',
  ios: 'http://localhost:5000',
  default: 'http://10.0.2.2:5000',
});

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // Lấy token từ bộ nhớ máy
    const token = await storage.getItem('token');
    if (token) {
      // Gắn vào header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;