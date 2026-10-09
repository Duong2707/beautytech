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
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleReset = () => {
    console.log('Reset password cho email:', email);
    router.push({
      pathname: '/verify-code',
      params: { email: email || 'contact@gmail.com' },
    });
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

          <Text style={styles.heading}>Forgot password</Text>

          <Text style={styles.desc}>
            Please enter your email to reset the password
          </Text>

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

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleReset}
          >
            <Text style={styles.btnText}>RESET PASSWORD</Text>
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