import React, { useState, useEffect } from 'react';
// @ts-ignore
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, ActivityIndicator, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../presentation/contexts/ThemeContext';
import { fetchNotifications } from '../services/notificationApi';

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifs = async () => {
      const data = await fetchNotifications();
      setNotifications(data);
      setLoading(false);
    };
    loadNotifs();
  }, []);

  const handleNotificationPress = async (item: any) => {
    if (item.type === 'promo' && item.voucherCode) {
      // Lưu mã voucher vào bộ nhớ tạm
      await AsyncStorage.setItem('@pendingVoucher', item.voucherCode);
      
      // Chuyển hướng sang trang Giỏ hàng (để user chọn sản phẩm)
      router.push('/cart'); 
    } else {
      // Xử lý thông báo hệ thống
      if (Platform.OS === 'web') {
        window.alert(item.content);
      } else {
        Alert.alert('Thông báo', item.content);
      }
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen}>
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
          <Text style={{ textAlign: 'center', marginTop: 50, color: theme.textMuted }}>Chưa có thông báo nào.</Text>
        ) : (
          notifications.map((item) => (
            <Pressable 
              key={item._id} 
              style={[dynamicStyles.card, !item.isRead && dynamicStyles.cardUnread]}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={[dynamicStyles.iconBox, { backgroundColor: item.type === 'promo' ? theme.primary : '#4A90E2' }]}>
                <Ionicons name={item.type === 'promo' ? "gift" : "notifications"} size={22} color="#FFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={dynamicStyles.title}>{item.title}</Text>
                <Text style={dynamicStyles.contentText}>{item.content}</Text>
                {item.voucherCode && (
                  <View style={dynamicStyles.voucherBadge}>
                    <Text style={dynamicStyles.voucherText}>Mã: {item.voucherCode} - Dùng ngay ➔</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))
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
  card: { flexDirection: 'row', backgroundColor: theme.card, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  cardUnread: { borderColor: theme.primary },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 4 },
  contentText: { fontSize: 13, color: theme.textMuted, lineHeight: 20 },
  voucherBadge: { backgroundColor: theme.isDark ? '#1E3320' : '#E8F5E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 10 },
  voucherText: { fontSize: 12, fontWeight: '700', color: '#4CAF50' }
});