// src/services/firebase.ts
// @ts-ignore
// src/data/datasources/remote/firebase.ts
import { initializeApp } from 'firebase/app';
// @ts-ignore
import { getAuth, initializeAuth, getReactNativePersistence, GoogleAuthProvider, Auth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYti83qOHM2a9SJuyc0xhwYBVvWmJwqbk",
  authDomain: "beautytech-16514.firebaseapp.com",
  projectId: "beautytech-16514",
  storageBucket: "beautytech-16514.firebasestorage.app",
  messagingSenderId: "213638045177",
  appId: "1:213638045177:web:05577f70be4065688f3128"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 👇 SỬA TẠI ĐÂY: Phân biệt môi trường Web và Native
let auth: Auth; 
if (Platform.OS === 'web') {
  // Trên Web: Firebase tự động dùng IndexedDB, không cần AsyncStorage
  auth = getAuth(app);
} else {
  // Trên Native (điện thoại): Dùng AsyncStorage để duy trì đăng nhập
  auth = initializeAuth(app, {
    // @ts-ignore (Bỏ qua lỗi type nếu có)
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

export { auth };
export const googleProvider = new GoogleAuthProvider();

