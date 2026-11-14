import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';

// @ts-ignore
import { ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuth } from '../presentation/contexts/AuthContext';
import { auth, googleProvider } from '../data/datasources/remote/firebase';
import api from '../data/datasources/remote/api';
import { signInWithPopup } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const WEB_LOGIN_URL = 'https://enchanting-fox-9000a8.netlify.app';

export default function LoginScreen() {
  const router = useRouter();
  const { login, setAuthData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  
  const [isAdminMode, setIsAdminMode] = useState(false);

  // 🌟 Hàm hiển thị thông báo hỗ trợ cả Web và Mobile
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // ==========================================
  // 1. XỬ LÝ TOKEN CỦA GOOGLE
  // ==========================================
  const handleFirebaseToken = async (idToken: string) => {
    try {
      const response = await api.post('/api/auth/firebase-login', { idToken });
      const { token, ...userData } = response.data.data;
      await setAuthData(userData, token);
    } catch (error: any) {
      let message = error?.response?.data?.message || 'Đăng nhập Google thất bại';
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        message = 'Không có kết nối Internet. Vui lòng kiểm tra Wifi/4G và thử lại!';
      }
      showAlert('Lỗi', message);
    } finally {
      setSocialLoading(false);
    }
  };

  // ==========================================
  // 2. XỬ LÝ TOKEN CỦA FACEBOOK (MỚI)
  // ==========================================
  const handleFacebookToken = async (accessToken: string) => {
    try {
      // Gọi đúng route facebook-login của Backend
      const response = await api.post('/api/auth/facebook-login', { accessToken });
      const { token, ...userData } = response.data.data;
      await setAuthData(userData, token);
    } catch (error: any) {
      let message = error?.response?.data?.message || 'Đăng nhập Facebook thất bại';
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        message = 'Không có kết nối Internet. Vui lòng kiểm tra Wifi/4G và thử lại!';
      }
      showAlert('Lỗi', message);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Lỗi', 'Vui lòng nhập email và password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password, isAdminMode);
    } catch (error: any) {
      let message = error?.response?.data?.message || 'Đăng nhập thất bại';
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        message = 'Không có kết nối Internet. Vui lòng kiểm tra Wifi/4G và thử lại!';
      }
      showAlert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 3. ĐĂNG NHẬP GOOGLE
  // ==========================================
  const handleGoogleLogin = async () => {
    if (isAdminMode) {
      showAlert('Thông báo', 'Quản trị viên vui lòng đăng nhập bằng Email/Mật khẩu!');
      return;
    }

    if (Platform.OS === 'web') {
      setSocialLoading(true);
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        await handleFirebaseToken(idToken);
      } catch (error: any) {
        let message = error.message || 'Đăng nhập Google thất bại';
        if (error.code === 'auth/network-request-failed') {
          message = 'Không có kết nối Internet. Vui lòng kiểm tra lại mạng!';
        }
        showAlert('Lỗi', message);
        setSocialLoading(false);
      }
      return;
    }

    setSocialLoading(true);
    const redirectUrl = Linking.createURL('callback');
    const authUrl = `${WEB_LOGIN_URL}?redirect=${encodeURIComponent(redirectUrl)}`;
    
    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === 'success') {
        const { url } = result;
        console.log("👉 Link trả về từ Google:", url);
        
        const parsedUrl = Linking.parse(url);
        const idToken = parsedUrl.queryParams?.idToken as string; 
        
        if (idToken) {
          await handleFirebaseToken(idToken); 
        } else {
          showAlert('Lỗi', 'Không lấy được idToken từ Google!');
          setSocialLoading(false);
        }
      } else {
        console.log('Người dùng đã hủy đăng nhập Google');
        setSocialLoading(false);
      }
    } catch (error) {
      console.error(error);
      showAlert('Lỗi', 'Không mở được trình duyệt');
      setSocialLoading(false);
    }
  };

  // ==========================================
  // 4. ĐĂNG NHẬP FACEBOOK (ĐÃ SỬA)
  // ==========================================
  const handleFacebookLogin = async () => {
    if (isAdminMode) {
      showAlert('Thông báo', 'Quản trị viên vui lòng đăng nhập bằng Email/Mật khẩu!');
      return;
    }

    if (Platform.OS === 'web') {
      setSocialLoading(true);
      const redirectUrl = `${window.location.origin}/callback`;
      const authUrl = `${WEB_LOGIN_URL}?redirect=${encodeURIComponent(redirectUrl)}`;
      window.location.href = authUrl;
      return;
    }

    setSocialLoading(true);
    const redirectUrl = Linking.createURL('callback');
    const authUrl = `${WEB_LOGIN_URL}?redirect=${encodeURIComponent(redirectUrl)}`;
    
    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      
if (result.type === 'success') {
        const { url } = result;
        console.log("👉 Link trả về từ Facebook:", url);
        
        // 👇 DÙNG REGEX ĐỂ BẮT TOKEN (Chuẩn nhất, không sợ lỗi exp://)
        const tokenMatch = url.match(/accessToken=([^&]+)/) || url.match(/access_token=([^&]+)/);
        const accessToken = tokenMatch ? tokenMatch[1] : null;
        
        if (accessToken) {
          console.log("✅ Đã bắt được Access Token thành công!");
          await handleFacebookToken(accessToken);
        } else {
          showAlert('Lỗi', 'Không lấy được accessToken từ Facebook!');
          setSocialLoading(false);
        }
      } else {
        console.log('Người dùng đã hủy đăng nhập Facebook');
        setSocialLoading(false);
      }
    } catch (error) {
      console.error(error);
      showAlert('Lỗi', 'Không mở được trình duyệt');
      setSocialLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Beauty Tech</Text>

          <View style={styles.toggleContainer}>
            <Pressable
              style={[styles.toggleBtn, !isAdminMode && styles.toggleBtnActive]}
              onPress={() => setIsAdminMode(false)}
            >
              <Text style={[styles.toggleText, !isAdminMode && styles.toggleTextActive]}>Khách hàng</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, isAdminMode && styles.toggleBtnActive]}
              onPress={() => setIsAdminMode(true)}
            >
              <Text style={[styles.toggleText, isAdminMode && styles.toggleTextActive]}>Quản trị viên</Text>
            </Pressable>
          </View>

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
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#2b2b32" />
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.forgotWrap} onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotText}>Forgot Password</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.loginBtn, (pressed || loading) && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.loginText}>LOGIN</Text>}
          </Pressable>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Or log in with</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={[styles.socialBtn, socialLoading && { opacity: 0.5 }]} onPress={handleGoogleLogin} disabled={socialLoading}>
              {socialLoading ? <ActivityIndicator color="#EA4335" /> : <Image source={require('../../assets/icon-google.png')} style={styles.socialIcon} resizeMode="contain" />}
            </Pressable>
            <Pressable style={[styles.socialBtn, socialLoading && { opacity: 0.5 }]} onPress={handleFacebookLogin} disabled={socialLoading}>
              {socialLoading ? <ActivityIndicator color="#1877F2" /> : <Image source={require('../../assets/icon-facebook.png')} style={styles.socialIcon} resizeMode="contain" />}
            </Pressable>
          </View>

          <Pressable style={styles.registerWrap} onPress={() => router.replace('/register')}>
            <Text style={styles.registerText}>
              Do you not have an account yet? <Text style={styles.registerLink}>REGISTER</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 40, alignItems: 'center' },
  logo: { width: 147, height: 97 },
  title: { marginTop: 17, fontFamily: 'Raleway_500Medium', fontSize: 40, color: '#e76988', textAlign: 'center' },
  
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 20, padding: 4, marginTop: 20, width: '100%', maxWidth: 300 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 16 },
  toggleBtnActive: { backgroundColor: '#e76988', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  toggleText: { fontFamily: 'Raleway_600SemiBold', fontSize: 14, color: '#888' },
  toggleTextActive: { color: '#ffffff' },

  inputWrapper: { width: '100%', marginTop: 33, position: 'relative' }, 
  labelBox: { position: 'absolute', top: -7, left: 26, paddingHorizontal: 5, backgroundColor: '#ffffff', zIndex: 1 },
  label: { fontFamily: 'Raleway_500Medium', fontSize: 9.2, color: '#b5b9ca' },
  input: {
    height: 54,
    borderWidth: 1.84,
    borderColor: '#eef4fa',
    borderRadius: 20.23,
    paddingHorizontal: 22,
    fontFamily: 'Raleway_500Medium',
    fontSize: 14.7,
    color: '#2b2b32',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any, boxShadow: 'inset 0 0 0 1000px #ffffff', WebkitBoxShadow: 'inset 0 0 0 1000px #ffffff' } : {}),
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', height: 54, borderWidth: 1.84, borderColor: '#eef4fa', borderRadius: 20.23, paddingRight: 16 },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 22,
    fontFamily: 'Raleway_800ExtraBold',
    fontSize: 14.7,
    color: '#2b2b32',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any, boxShadow: 'inset 0 0 0 1000px #ffffff', WebkitBoxShadow: 'inset 0 0 0 1000px #ffffff' } : {}),
  },
  eyeBtn: { padding: 4 },
  forgotWrap: { width: '100%', alignItems: 'flex-end', marginTop: 15, paddingRight: 12 },
  forgotText: { fontFamily: 'Raleway_500Medium', fontSize: 13, color: '#eb557a', textDecorationLine: 'underline' },
  loginBtn: { width: '100%', height: 57, backgroundColor: '#f5809d', borderRadius: 28.74, alignItems: 'center', justifyContent: 'center', marginTop: 33 },
  loginText: { fontFamily: 'Raleway_600SemiBold', fontSize: 16.6, color: '#ffffff', letterSpacing: 0.5 },
  orRow: { width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 19 },
  orLine: { flex: 1, height: 1, backgroundColor: '#2b2b32', opacity: 0.3 },
  orText: { marginHorizontal: 10, fontFamily: 'Raleway_500Medium', fontSize: 11, color: '#2b2b32' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 59, width: '100%', marginTop: 33 },
  socialBtn: { width: 83, height: 54, borderRadius: 20.23, borderWidth: 1.84, borderColor: '#e8eaed', alignItems: 'center', justifyContent: 'center' },
  socialIcon: { width: 24, height: 24 },
  registerWrap: { marginTop: 38, alignItems: 'center' },
  registerText: { fontFamily: 'Raleway_500Medium', fontSize: 11, color: '#2b2b32', textAlign: 'center' },
  registerLink: { color: '#eb557a', fontWeight: '700' },
});