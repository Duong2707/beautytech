import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../data/datasources/remote/api';
import { useAuth } from '../presentation/contexts/AuthContext';
import { useTheme } from '../presentation/contexts/ThemeContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      showAlert('Lỗi', 'Họ tên không được để trống');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showAlert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    const isChangingEmail = newEmail !== user?.email;
    const isChangingPass = newPassword.trim() !== '';

    if ((isChangingEmail || isChangingPass) && !currentPassword) {
      showAlert('Yêu cầu', 'Vui lòng nhập Mật khẩu hiện tại để đổi Email hoặc Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        fullName: fullName, 
        phone: phone,
        newEmail: isChangingEmail ? newEmail : undefined,
        currentPassword: (isChangingEmail || isChangingPass) ? currentPassword : undefined,
        newPassword: isChangingPass ? newPassword : undefined
      };

      const res = await api.put('/api/auth/profile', payload);
      
      if (res.data.success) {
        updateUser(res.data.data);
        showAlert('Thành công', 'Cập nhật hồ sơ thành công!', () => router.back());
      }
    } catch (error: any) {
      // In lỗi ra màn hình rõ ràng
      const msg = error.response?.data?.message || error.message || 'Lỗi không xác định';
      showAlert('Lỗi cập nhật', msg);
    } finally {
      setLoading(false);
    }
  };

  // Hàm hỗ trợ hiển thị thông báo trên cả Web và Mobile
  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
      if (onOk) onOk();
    } else {
      Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
    }
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{fullName.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nhập họ tên" placeholderTextColor={theme.textMuted} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Nhập SĐT" placeholderTextColor={theme.textMuted} keyboardType="phone-pad" />
        </View>

        <Text style={[styles.label, { marginTop: 15, color: theme.primary }]}>Thông tin bảo mật</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={newEmail} onChangeText={setNewEmail} placeholder="Email" placeholderTextColor={theme.textMuted} keyboardType="email-address" autoCapitalize="none" />
        </View>

        {(newEmail !== user?.email || newPassword.trim() !== '') && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={20} color="#FF9800" />
            <Text style={styles.warningText}>Nhập mật khẩu hiện tại để xác nhận thay đổi.</Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Bắt buộc nếu đổi Email/Pass" placeholderTextColor={theme.textMuted} secureTextEntry />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mật khẩu mới (Bỏ trống nếu không đổi)</Text>
          <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="Mật khẩu mới" placeholderTextColor={theme.textMuted} secureTextEntry />
        </View>

        {newPassword.trim() !== '' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Nhập lại mật khẩu mới" placeholderTextColor={theme.textMuted} secureTextEntry />
          </View>
        )}

        <Pressable style={styles.saveButton} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Lưu thay đổi</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  content: { padding: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFF' },
  formGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 8 },
  input: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 14, fontSize: 15, color: theme.text },
  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', padding: 12, borderRadius: 10, marginBottom: 15, gap: 8 },
  warningText: { color: '#E65100', fontSize: 13, flex: 1, lineHeight: 18 },
  saveButton: { backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});