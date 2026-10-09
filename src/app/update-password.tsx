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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleUpdate = () => {
    console.log('Update password:', { password, repeatPassword });
    router.replace('/login');
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
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleUpdate}
          >
            <Text style={styles.btnText}>UPDATE PASSWORD</Text>
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