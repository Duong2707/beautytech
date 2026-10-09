import React from 'react';
import { useRouter } from 'expo-router';
import SplashScreen from '../components/SplashScreen';

export default function Index() {
  const router = useRouter();

  const handlePress = () => {
    console.log('👉 Chạm logo, chuyển sang /login');
    router.replace('/login');
  };

  return <SplashScreen onPress={handlePress} />;
}