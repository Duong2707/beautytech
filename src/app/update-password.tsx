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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { storage } from '../data/datasources/local/storage';
import { authService } from '../data/datasources/remote/authService';

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const emailFromParams = (params.email as string) || '';

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    let email = emailFromParams;
    if (!email) {
      email = (await storage.getItem('reset_email')) || '';
    }

    console.log('📧 Email dùng để update:', email);

    if (!email) {
      if (Platform.OS === 'web') {
        window.alert('Không tìm thấy email. Vui lòng làm lại từ đầu.');
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy email. Vui lòng làm lại từ đầu.');
      }
      return;
    }

    if (!password || !repeatPassword) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập đầy đủ');
      } else {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ');
      }
      return;
    }

    if (password !== repeatPassword) {
      if (Platform.OS === 'web') {
        window.alert('Password nhập lại không khớp');
      } else {
        Alert.alert('Lỗi', 'Password nhập lại không khớp');
      }
      return;
    }

    if (password.length < 6) {
      if (Platform.OS === 'web') {
        window.alert('Password phải có ít nhất 6 ký tự');
      } else {
        Alert.alert('Lỗi', 'Password phải có ít nhất 6 ký tự');
      }
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, password);
      await storage.removeItem('reset_email');

      console.log('✅ Đặt lại mật khẩu thành công');

      // Chuyển về Login trước
      router.replace('/login');

      // Alert sau khi chuyển trang (không block)
      setTimeout(() => {
        if (Platform.OS === 'web') {
          window.alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
        } else {
          Alert.alert('Thành công', 'Đặt lại mật khẩu thành công');
        }
      }, 300);
    } catch (error: any) {
      console.error('❌ Update password error:', error);
      const message =
        error?.response?.data?.message || 'Có lỗi xảy ra';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Lỗi', message);
      }
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

          <Text style={styles.brand}>Beauty Tech</Text>

          <Text style={styles.heading}>Set a new password</Text>

          <Text style={styles.desc}>
            Create a new password. Ensure it differs from previous ones for
            security
          </Text>

          <View style={styles.inputWrapper}>
            <View style={styles.labelBox}>
              <Text style={styles.label}>New Password</Text>
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

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              (pressed || loading) && { opacity: 0.7 },
            ]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.btnText}>UPDATE PASSWORD</Text>
            )}
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
  brand: {
    marginTop: 10,
    fontFamily: 'Raleway_500Medium',
    fontSize: 40,
    color: '#e76988',
    textAlign: 'center',
  },
  heading: {
    marginTop: 40,
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 22,
    color: '#eb557a',
    textAlign: 'center',
  },
  desc: {
    marginTop: 12,
    fontFamily: 'Raleway_500Medium',
    fontSize: 11,
    color: '#2b2b32',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  inputWrapper: {
    width: '100%',
    marginTop: 30,
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
  btn: {
    width: '100%',
    height: 57,
    backgroundColor: '#f5809d',
    borderRadius: 28.74,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  btnText: {
    fontFamily: 'Raleway_600SemiBold',
    fontSize: 16.6,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});