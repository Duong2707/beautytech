import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    idToken?: string;
    accessToken?: string;
  }>();
  const { setAuthData } = useAuth();
  const [status, setStatus] = useState('Đang xử lý đăng nhập...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔍 Params:', JSON.stringify(params));

        const idToken = params.idToken as string | undefined;
        const accessToken = params.accessToken as string | undefined;

        let endpoint = '';
        let body: any = {};

        if (idToken) {
          console.log('🔑 Có Google idToken');
          endpoint = '/api/auth/firebase-login';
          body = { idToken };
        } else if (accessToken) {
          console.log('🔑 Có Facebook accessToken');
          endpoint = '/api/auth/facebook-login';
          body = { accessToken };
        } else {
          console.log('❌ Không có token');
          setStatus('Không có token');
          setTimeout(() => router.replace('/login'), 1500);
          return;
        }

        setStatus('Đang xác thực với server...');
        const response = await api.post(endpoint, body);
        const { token, ...userData } = response.data.data;

        await setAuthData(userData, token);
        setStatus('Đăng nhập thành công!');
        router.replace('/home');
      } catch (error: any) {
        console.error('❌ Callback error:', error);
        const msg =
          error?.response?.data?.message || error.message || 'Lỗi';
        setStatus('Lỗi: ' + msg);
        setTimeout(() => router.replace('/login'), 2500);
      }
    };

    const timer = setTimeout(handleCallback, 500);
    return () => clearTimeout(timer);
  }, [params.idToken, params.accessToken]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#e76988" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 16,
    color: '#2b2b32',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});