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
import { CartProvider } from '../presentation/contexts/CartContext'; // <-- Thêm CartProvider

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
        {/* Bọc CartProvider vào trong AuthProvider */}
        <CartProvider> 
          <Stack screenOptions={{ headerShown: false }} />
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}