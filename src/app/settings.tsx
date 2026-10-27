import React, { useState, useEffect } from 'react';
// @ts-ignore
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Switch, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../presentation/contexts/ThemeContext';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  
  // Mặc định ban đầu là bật (true)
  const [promoNotif, setPromoNotif] = useState(true);
  const [orderNotif, setOrderNotif] = useState(true);

  // 1. Load trạng thái đã lưu khi mở trang
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedPromo = await AsyncStorage.getItem('@setting_promo_notif');
        const savedOrder = await AsyncStorage.getItem('@setting_order_notif');
        
        if (savedPromo !== null) setPromoNotif(savedPromo === 'true');
        if (savedOrder !== null) setOrderNotif(savedOrder === 'true');
      } catch (error) {
        console.log("Lỗi load cài đặt:", error);
      }
    };
    loadSettings();
  }, []);

  // 2. Hàm thay đổi và lưu trạng thái
  const handleTogglePromo = async (value: boolean) => {
    setPromoNotif(value);
    await AsyncStorage.setItem('@setting_promo_notif', value.toString());
  };

  const handleToggleOrder = async (value: boolean) => {
    setOrderNotif(value);
    await AsyncStorage.setItem('@setting_order_notif', value.toString());
  };

  const handleDeleteAccount = () => {
    const performDelete = () => {
      if (Platform.OS === 'web') {
        window.alert("Tài khoản của bạn đã được yêu cầu xóa. (Tính năng đang phát triển)");
      } else {
        Alert.alert("Thông báo", "Tài khoản của bạn đã được yêu cầu xóa.");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa tài khoản? Mọi dữ liệu sẽ bị mất và không thể khôi phục!")) {
        performDelete();
      }
    } else {
      Alert.alert(
        "Cảnh báo",
        "Bạn có chắc chắn muốn xóa tài khoản? Mọi dữ liệu sẽ bị mất và không thể khôi phục!",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Xóa vĩnh viễn", style: "destructive", onPress: performDelete }
        ]
      );
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      <View style={dynamicStyles.header}>
        <Pressable style={dynamicStyles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        
        {/* NHÓM 1: TÀI KHOẢN & BẢO MẬT */}
        <Text style={dynamicStyles.sectionTitle}>Tài khoản & Bảo mật</Text>
        <View style={dynamicStyles.sectionCard}>
          <Pressable style={dynamicStyles.rowItem} onPress={() => router.push('/update-password')}>
            <View style={dynamicStyles.iconBox}><Ionicons name="lock-closed-outline" size={20} color={theme.primary} /></View>
            <Text style={dynamicStyles.rowText}>Đổi mật khẩu</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </Pressable>
          
          <View style={dynamicStyles.divider} />
          
          <Pressable style={dynamicStyles.rowItem} onPress={handleDeleteAccount}>
            <View style={[dynamicStyles.iconBox, { backgroundColor: '#FFEBEE' }]}><Ionicons name="trash-outline" size={20} color="#FF6B6B" /></View>
            <Text style={[dynamicStyles.rowText, { color: '#FF6B6B' }]}>Xóa tài khoản</Text>
            <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
          </Pressable>
        </View>

        {/* NHÓM 2: TÙY CHỈNH TRẢI NGHIỆM */}
        <Text style={dynamicStyles.sectionTitle}>Tùy chỉnh trải nghiệm</Text>
        <View style={dynamicStyles.sectionCard}>
          <View style={dynamicStyles.rowItem}>
            <View style={dynamicStyles.iconBox}><Ionicons name={theme.isDark ? "moon" : "sunny"} size={20} color={theme.primary} /></View>
            <Text style={dynamicStyles.rowText}>Chế độ tối (Dark Mode)</Text>
            <Switch 
              value={theme.isDark} 
              onValueChange={toggleTheme} 
              trackColor={{ false: "#E0E0E0", true: "#BC6280" }}
              thumbColor={Platform.OS === 'android' ? "#FFF" : ""}
            />
          </View>

          <View style={dynamicStyles.divider} />

          <View style={dynamicStyles.rowItem}>
            <View style={dynamicStyles.iconBox}><Ionicons name="notifications-outline" size={20} color={theme.primary} /></View>
            <Text style={dynamicStyles.rowText}>Thông báo khuyến mãi</Text>
            <Switch 
              value={promoNotif} 
              onValueChange={handleTogglePromo} // Đã nối hàm lưu
              trackColor={{ false: "#E0E0E0", true: "#BC6280" }}
              thumbColor={Platform.OS === 'android' ? "#FFF" : ""}
            />
          </View>

          <View style={dynamicStyles.divider} />

          <View style={dynamicStyles.rowItem}>
            <View style={dynamicStyles.iconBox}><Ionicons name="cube-outline" size={20} color={theme.primary} /></View>
            <Text style={dynamicStyles.rowText}>Thông báo đơn hàng</Text>
            <Switch 
              value={orderNotif} 
              onValueChange={handleToggleOrder} // Đã nối hàm lưu
              trackColor={{ false: "#E0E0E0", true: "#BC6280" }}
              thumbColor={Platform.OS === 'android' ? "#FFF" : ""}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: theme.background },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  content: { padding: 20, paddingBottom: 50 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 10, marginLeft: 4 },
  sectionCard: { backgroundColor: theme.card, borderRadius: 16, paddingHorizontal: 16, marginBottom: 25, borderWidth: 1, borderColor: theme.border },
  rowItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.isDark ? '#333' : '#FBEFF3', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowText: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.text },
  divider: { height: 1, backgroundColor: theme.border, marginLeft: 48 },
});