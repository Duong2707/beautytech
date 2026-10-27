import { Stack } from 'expo-router';
import {
  useFonts,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_800ExtraBold,
} from '@expo-google-fonts/raleway';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; 

import { AuthProvider } from '../presentation/contexts/AuthContext';
import { CartProvider } from '../presentation/contexts/CartContext';
import { ThemeProvider } from '../presentation/contexts/ThemeContext'; 
// 👇 1. Import thêm WishlistProvider
import { WishlistProvider } from '../presentation/contexts/WishlistContext'; 

export default function RootLayout() {
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
            {/* 👇 2. Bọc WishlistProvider ở đây, bên ngoài thẻ Stack */}
            <WishlistProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </WishlistProvider>
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}