import React, { useState, useEffect } from 'react';
// @ts-ignore
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../presentation/contexts/ThemeContext';
import { fetchNotifications, markNotificationReadApi } from '../services/notificationApi';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tải dữ liệu từ Database khi mở trang
  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        console.log("Lỗi tải thông báo:", error);
      } finally {
        setLoading(false);
      }
    };
    loadNotifs();
  }, []);

  const handleNotificationPress = async (item: any) => {
    // 1. Đánh dấu đã đọc trên giao diện ngay lập tức (Optimistic UI)
    if (!item.isRead) {
      setNotifications((prev) => 
        prev.map((n) => n._id === item._id ? { ...n, isRead: true } : n)
      );

      // 2. Gọi API lưu vào Database
      try {
        await markNotificationReadApi(item._id);
      } catch (error) {
        console.log("Lỗi khi lưu trạng thái đã đọc:", error);
      }
    }

    // 3. Xử lý hành động chuyển trang hoặc hiện thông báo
    if (item.type === 'promo' && item.voucherCode) {
      // Lưu mã voucher vào bộ nhớ tạm để thanh toán
      await AsyncStorage.setItem('@pendingVoucher', item.voucherCode);
      
      // Chuyển hướng sang trang Giỏ hàng
      router.push('/cart'); 
    } else {
      // Xử lý thông báo hệ thống hoặc đơn hàng (hiện popup)
      if (Platform.OS === 'web') {
        window.alert(`${item.title}\n\n${item.content}`);
      } else {
        Alert.alert(item.title, item.content);
      }
    }
  };

  // 🌟 HÀM LẤY ICON VÀ MÀU THEO LOẠI THÔNG BÁO
  const getIconAndColor = (type: string) => {
    switch (type) {
      case 'promo':
        return { name: 'gift' as const, color: theme.primary }; // Màu hồng cho Voucher
      case 'order':
        return { name: 'receipt' as const, color: '#4CAF50' }; // Màu xanh lá cho Đơn hàng
      default:
        return { name: 'notifications' as const, color: '#4A90E2' }; // Màu xanh dương cho Hệ thống
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      <View style={{paddingTop: 30}} /> 
      <View style={dynamicStyles.header}>
        <Pressable style={dynamicStyles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle}>Thông báo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : notifications.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <Ionicons name="notifications-off-outline" size={60} color={theme.textMuted} />
            <Text style={dynamicStyles.emptyText}>Chưa có thông báo nào.</Text>
          </View>
        ) : (
          notifications.map((item) => {
            const iconData = getIconAndColor(item.type);

            return (
              <Pressable 
                key={item._id} 
                style={[dynamicStyles.card, !item.isRead && dynamicStyles.cardUnread]}
                onPress={() => handleNotificationPress(item)}
              >
                <View style={[dynamicStyles.iconBox, { backgroundColor: iconData.color }]}>
                  <Ionicons name={iconData.name} size={22} color="#FFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={dynamicStyles.title} numberOfLines={1}>{item.title}</Text>
                    {/* Chấm đỏ thông báo chưa đọc */}
                    {!item.isRead && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary }} />}
                  </View>
                  <Text style={dynamicStyles.contentText} numberOfLines={2}>{item.content}</Text>
                  
                  {item.voucherCode && (
                    <View style={dynamicStyles.voucherBadge}>
                      <Text style={dynamicStyles.voucherText}>Mã: {item.voucherCode} - Dùng ngay ➔</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  content: { padding: 20, paddingBottom: 50 },
  
  emptyState: { alignItems: 'center', marginTop: 80, gap: 15 },
  emptyText: { color: theme.textMuted, fontSize: 14 },
  
  card: { flexDirection: 'row', backgroundColor: theme.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  cardUnread: { borderColor: theme.primary, backgroundColor: theme.isDark ? '#2A1F23' : '#FFF8FA' }, // Nền hồng nhạt nếu chưa đọc
  
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: theme.text, flex: 1, marginRight: 8 },
  contentText: { fontSize: 13, color: theme.textMuted, lineHeight: 20 },
  
  voucherBadge: { backgroundColor: theme.isDark ? '#1E3320' : '#E8F5E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 10 },
  voucherText: { fontSize: 12, fontWeight: '700', color: '#4CAF50' }
});