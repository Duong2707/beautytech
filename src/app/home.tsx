import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../presentation/contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const displayName = user?.fullName?.trim() || user?.email || 'Người dùng';
  const displayEmail = user?.email || '';
  const displayRole = user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <Text style={styles.greeting}>Xin chào</Text>
        <Text style={styles.mainInfo}>{displayName}</Text>
        <Text style={styles.emailText}>{displayEmail}</Text>
        <Text style={styles.roleText}>Vai trò: {displayRole}</Text>

        {/* Nút phân tích da AI */}
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.analyzeBtn,
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => router.push('/analyze')}
        >
          <Text style={styles.btnText}>📸 Phân tích da bằng AI</Text>
        </Pressable>

        {/* Nút đăng xuất */}
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          onPress={handleLogout}
        >
          <Text style={styles.btnText}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f5809d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 26,
    color: '#2b2b32',
    marginBottom: 8,
  },
  mainInfo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e76988',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 6,
    textAlign: 'center',
  },
  roleText: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
  },
  btn: {
    marginTop: 20,
    paddingHorizontal: 40,
    paddingVertical: 14,
    backgroundColor: '#f5809d',
    borderRadius: 28,
  },
  analyzeBtn: {
    marginTop: 40,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});