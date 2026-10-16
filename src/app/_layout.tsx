import { Stack } from 'expo-router';
import {
  useFonts,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_800ExtraBold,
} from '@expo-google-fonts/raleway';
import { View } from 'react-native';
import { AuthProvider } from '../presentation/contexts/AuthContext';

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
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}