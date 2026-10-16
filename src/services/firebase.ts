// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

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

// Khởi tạo Auth và Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

