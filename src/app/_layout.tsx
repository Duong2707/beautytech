import { Stack, useRouter, useSegments } from 'expo-router';
import {
  useFonts,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_800ExtraBold,
} from '@expo-google-fonts/raleway';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; 
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '../presentation/contexts/AuthContext';
import { CartProvider } from '../presentation/contexts/CartContext';
import { ThemeProvider } from '../presentation/contexts/ThemeContext'; 
import { WishlistProvider } from '../presentation/contexts/WishlistContext'; 
import { setupNetworkListener } from '../services/offlineSync';

// 👇 1. Tạo một Component "Bảo vệ" để kiểm soát điều hướng
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Kiểm tra xem user đang đứng ở khu vực nào (auth group hay app group)
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'forgot-password';

    if (!user && !inAuthGroup) {
      // Nếu chưa đăng nhập mà không ở trang auth -> Đá về login
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Nếu đã đăng nhập mà lại đứng ở trang login -> Đá về đúng vai trò
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/home');
      }
    }
  }, [user, loading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  useEffect(() => {
    setupNetworkListener();
  }, []);

  const [fontsLoaded] = useFonts({
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#ffffff' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider> 
            <WishlistProvider>
              {/* 👇 2. Gọi Component bảo vệ ở đây thay vì gọi <Stack /> trực tiếp */}
              <RootLayoutNav />
            </WishlistProvider>
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}