import axios from 'axios';
import { sqliteStorage as AsyncStorage } from '../local/sqliteStorage'; 
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const BASE_URL = 'https://beautytech-backend.onrender.com'; 
// Tự động lấy IP của máy tính đang chạy Expo
const getBaseURL = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(':')[0];

  if (!localhost) {
    // Dự phòng nếu không lấy được IP (VD: máy ảo Android)
    return Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
  }
  return `http://${localhost}:5000`;
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn Token vào Header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Lỗi lấy token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;