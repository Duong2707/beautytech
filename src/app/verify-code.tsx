import React, { useRef, useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';

const CODE_LENGTH = 4;

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? 'contact@gmail.com';

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    console.log('Verify code:', fullCode);
    if (fullCode.length !== CODE_LENGTH) {
      console.log('Chưa nhập đủ mã');
      return;
    }
    router.push('/update-password');
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

          <Text style={styles.heading}>Check your email</Text>

          <Text style={styles.desc}>
            We sent a reset link to{' '}
            <Text style={styles.emailBold}>{email}</Text> enter{' '}
            {CODE_LENGTH} digit code that mentioned in the email
          </Text>

          <View style={styles.codeRow}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputsRef.current[i] = ref;
                }}
                style={styles.codeBox}
                value={digit}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.btn,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleVerify}
          >
            <Text style={styles.btnText}>VERIFY CODE</Text>
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
    paddingHorizontal: 15,
    lineHeight: 16,
  },
  emailBold: {
    fontFamily: 'Raleway_800ExtraBold',
    color: '#2b2b32',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 35,
    width: '100%',
  },
  codeBox: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#d0d7e2',
    borderRadius: 12,
    fontFamily: 'Raleway_800ExtraBold',
    fontSize: 26,
    color: '#2b2b32',
    backgroundColor: '#ffffff',
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