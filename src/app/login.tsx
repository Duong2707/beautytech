import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuth } from '../context/AuthContext';

// Firebase (chỉ dùng cho Google)
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

// Services
import api from '../services/api';

const WEB_LOGIN_URL = 'https://enchanting-fox-9000a8.netlify.app';

export default function LoginScreen() {
  const router = useRouter();
  const { login, setAuthData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  // Xử lý idToken từ Firebase (Google)
  const handleFirebaseToken = async (idToken: string) => {
    try {
      const response = await api.post('/api/auth/firebase-login', { idToken });
      const { token, ...userData } = response.data.data;

      await setAuthData(userData, token);
      router.replace('/home');
    } catch (error: any) {
      console.error('❌ Firebase login error:', error);
      const message =
        error?.response?.data?.message || 'Đăng nhập thất bại';
      Alert.alert('Lỗi', message);
    } finally {
      setSocialLoading(false);
    }
  };

  // Đăng nhập email/password
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/home');
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Đăng nhập thất bại';
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập Google
  const handleGoogleLogin = async () => {
    // Trên WEB: dùng popup Firebase
    if (Platform.OS === 'web') {
      setSocialLoading(true);
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        await handleFirebaseToken(idToken);
      } catch (error: any) {
        console.error('❌ Web Google login error:', error);
        Alert.alert('Lỗi', error.message || 'Đăng nhập Google thất bại');
        setSocialLoading(false);
      }
      return;
    }

    // Trên MOBILE: mở web trung gian
    setSocialLoading(true);
    const redirectUrl = Linking.createURL('callback');
    const authUrl = `${WEB_LOGIN_URL}?redirect=${encodeURIComponent(redirectUrl)}`;

    try {
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (error) {
      console.error('❌ Open browser error:', error);
      Alert.alert('Lỗi', 'Không mở được trình duyệt');
      setSocialLoading(false);
    }
  };

  // Đăng nhập Facebook
  const handleFacebookLogin = async () => {
    // Trên WEB: redirect đến web trung gian
    if (Platform.OS === 'web') {
      setSocialLoading(true);
      const redirectUrl = `${window.location.origin}/callback`;
      const authUrl = `${WEB_LOGIN_URL}?redirect=${encodeURIComponent(redirectUrl)}`;
      window.location.href = authUrl;
      return;
    }

    // Trên MOBILE: mở browser
    setSocialLoading(true);
    const redirectUrl = Linking.createURL('callback');
    const authUrl = `${WEB_LOGIN_URL}?redirect=${encodeURIComponent(redirectUrl)}`;

    try {
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (error) {
      console.error('❌ Open browser error:', error);
      Alert.alert('Lỗi', 'Không mở được trình duyệt');
      setSocialLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Beauty Tech</Text>

          <View style={styles.inputWrapper}>
            <View style={styles.labelBox}>
              <Text style={styles.label}>Gamail</Text>
            </View>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="makeup@gmail.com"
              placeholderTextColor="#2b2b32"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputWrapper, { marginTop: 18 }]}>
            <View style={styles.labelBox}>
              <Text style={styles.label}>Password</Text>
            </View>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="****************"
                placeholderTextColor="#2b2b32"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#2b2b32"
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.forgotWrap}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotText}>Forgot Password</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.loginBtn,
              (pressed || loading) && { opacity: 0.7 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginText}>LOGIN</Text>
            )}
          </Pressable>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Or log in with</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialRow}>
            {/* Google */}
            <Pressable
              style={[styles.socialBtn, socialLoading && { opacity: 0.5 }]}
              onPress={handleGoogleLogin}
              disabled={socialLoading}
            >
              {socialLoading ? (
                <ActivityIndicator color="#EA4335" />
              ) : (
                <Image
                  source={require('../../assets/icon-google.png')}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              )}
            </Pressable>

            {/* Facebook */}
            <Pressable
              style={[styles.socialBtn, socialLoading && { opacity: 0.5 }]}
              onPress={handleFacebookLogin}
              disabled={socialLoading}
            >
              {socialLoading ? (
                <ActivityIndicator color="#1877F2" />
              ) : (
                <Image
                  source={require('../../assets/icon-facebook.png')}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              )}
            </Pressable>
          </View>

          <Pressable
            style={styles.registerWrap}
            onPress={() => router.replace('/register')}
          >
            <Text style={styles.registerText}>
              Do you not have an account yet?{' '}
              <Text style={styles.registerLink}>REGISTER</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: { width: 147, height: 97 },
  title: {
    marginTop: 17,
    fontFamily: 'Raleway_500Medium',
    fontSize: 40,
    color: '#e76988',
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    marginTop: 53,
    position: 'relative',
  },
  labelBox: {
    position: 'absolute',
    top: -7,
    left: 26,
    paddingHorizontal: 5,
    backgroundColor: '#ffffff',
    zIndex: 1,
  },
  label: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 9.2,
    color: '#b5b9ca',
  },
  input: {
    height: 54,
    borderWidth: 1.84,
    borderColor: '#eef4fa',
    borderRadius: 20.23,
    paddingHorizontal: 22,
    fontFamily: 'Raleway_500Medium',
    fontSize: 14.7,
    color: '#2b2b32',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderWidth: 1.84,
    borderColor: '#eef4fa',
    borderRadius: 20.23,
    paddingRight: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 22,
    fontFamily: 'Raleway_800ExtraBold',
    fontSize: 14.7,
    color: '#2b2b32',
  },
  eyeBtn: { padding: 4 },
  forgotWrap: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 15,
    paddingRight: 12,
  },
  forgotText: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 13,
    color: '#eb557a',
    textDecorationLine: 'underline',
  },
  loginBtn: {
    width: '100%',
    height: 57,
    backgroundColor: '#f5809d',
    borderRadius: 28.74,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 33,
  },
  loginText: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 16.6,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  orRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 19,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2b2b32',
    opacity: 0.3,
  },
  orText: {
    marginHorizontal: 10,
    fontFamily: 'Raleway_500Medium',
    fontSize: 11,
    color: '#2b2b32',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 59,
    width: '100%',
    marginTop: 33,
  },
  socialBtn: {
    width: 83,
    height: 54,
    borderRadius: 20.23,
    borderWidth: 1.84,
    borderColor: '#e8eaed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: { width: 24, height: 24 },
  registerWrap: { marginTop: 38, alignItems: 'center' },
  registerText: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 11,
    color: '#2b2b32',
    textAlign: 'center',
  },
  registerLink: { color: '#eb557a', fontWeight: '700' },
});