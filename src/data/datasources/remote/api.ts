import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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
  baseURL: getBaseURL(),
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