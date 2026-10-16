import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';

const BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5000'
    : 'http://192.168.40.37:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;