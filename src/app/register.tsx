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
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !repeatPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== repeatPassword) {
      Alert.alert('Lỗi', 'Password nhập lại không khớp');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Password phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, '', '');
      router.replace('/home');
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Đăng ký thất bại';
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
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

          {/* Email */}
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

          {/* Password */}
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
                  color="#b5b9ca"
                />
              </Pressable>
            </View>
          </View>

          {/* Repeat Password */}
          <View style={[styles.inputWrapper, { marginTop: 18 }]}>
            <View style={styles.labelBox}>
              <Text style={styles.label}>Repeat Password</Text>
            </View>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                placeholder="****************"
                placeholderTextColor="#2b2b32"
                secureTextEntry={!showRepeatPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowRepeatPassword(!showRepeatPassword)}
                hitSlop={10}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showRepeatPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#b5b9ca"
                />
              </Pressable>
            </View>
          </View>

          {/* Register button */}
          <Pressable
            style={({ pressed }) => [
              styles.registerBtn,
              (pressed || loading) && { opacity: 0.7 },
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.registerBtnText}>REGISTER</Text>
            )}
          </Pressable>

          {/* Back to login */}
          <Pressable
            style={styles.loginWrap}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink}>LOG IN</Text>
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
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: { width: 147, height: 97 },
  title: {
    marginTop: 10,
    fontFamily: 'Raleway_500Medium',
    fontSize: 40,
    color: '#e76988',
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    marginTop: 40,
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
  registerBtn: {
    width: '100%',
    height: 57,
    backgroundColor: '#f5809d',
    borderRadius: 28.74,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  registerBtnText: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 16.6,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  orRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
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
    marginTop: 25,
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
  loginWrap: { marginTop: 30, alignItems: 'center' },
  loginText: {
    fontFamily: 'Raleway_500Medium',
    fontSize: 11,
    color: '#2b2b32',
    textAlign: 'center',
  },
  loginLink: { color: '#eb557a', fontWeight: '700' },
});