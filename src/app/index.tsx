
import React from 'react';
import { useRouter } from 'expo-router';
import SplashScreen from '../components/SplashScreen';

export default function Index() {
  const router = useRouter();

  const handlePress = () => {
    router.replace('/home');
  };

  return <SplashScreen onPress={handlePress} />;
}
