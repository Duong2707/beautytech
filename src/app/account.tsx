import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
// @ts-ignore
import { Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, Platform, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../presentation/contexts/AuthContext";
import { useTheme } from "../presentation/contexts/ThemeContext"; 
import { useWishlist } from "../presentation/contexts/WishlistContext"; // 👈 Thêm import

const menuItems = [
  { icon: "person-outline" as const, title: "Chỉnh sửa hồ sơ", subtitle: "Cập nhật thông tin cá nhân" },
  { icon: "receipt-outline" as const, title: "Đơn hàng của tôi", subtitle: "Theo dõi đơn hàng đã đặt" },
  { icon: "heart-outline" as const, title: "Sản phẩm yêu thích", subtitle: "Danh sách mỹ phẩm yêu thích" },
  { icon: "location-outline" as const, title: "Địa chỉ giao hàng", subtitle: "Quản lý địa chỉ nhận hàng" },
  { icon: "notifications-outline" as const, title: "Thông báo", subtitle: "Ưu đãi và cập nhật mới" },
  { icon: "settings-outline" as const, title: "Cài đặt", subtitle: "Tùy chỉnh tài khoản của bạn" },
];

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); 
  const { wishlistIds } = useWishlist(); // 👈 Lấy danh sách ID yêu thích

  const [orderCount, setOrderCount] = useState(0);
  const [diaryCount, setDiaryCount] = useState(0);

  const loadStatistics = async () => {
    try {
      // 1. Đếm tổng số đơn hàng
      const ordersStr = await AsyncStorage.getItem('@orders');
      if (ordersStr) {
        const orders = JSON.parse(ordersStr);
        setOrderCount(Array.isArray(orders) ? orders.length : 0);
      }

      // 2. Đếm tổng số lần soi da
      const possibleDiaryKeys = ['@diary', '@skin_diary', '@diary_entries', '@history'];
      let diaryDataStr = null;
      
      for (const key of possibleDiaryKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          diaryDataStr = data;
          break;
        }
      }

      if (diaryDataStr) {
        const parsed = JSON.parse(diaryDataStr);
        if (Array.isArray(parsed)) {
          setDiaryCount(parsed.length);
        } else if (parsed.data && Array.isArray(parsed.data)) {
          setDiaryCount(parsed.data.length);
        } else {
          setDiaryCount(0);
        }
      } else {
        setDiaryCount(0);
      }
    } catch (error) {
      console.log("Lỗi load thống kê:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, [])
  );

  const handleMenuPress = (title: string) => {
    if (title === "Chỉnh sửa hồ sơ") { router.push("/edit-profile"); return; }
    if (title === "Đơn hàng của tôi") { router.push("/orders"); return; }
    if (title === "Địa chỉ giao hàng") { router.push("/shipping-address"); return; }
    if (title === "Thông báo") { router.push("/notifications"); return; }
    if (title === "Cài đặt") { router.push("/settings"); return; }
    
    // 👇 CHUYỂN SANG TRANG WISHLIST
    if (title === "Sản phẩm yêu thích") { 
      router.push("/wishlist"); 
      return; 
    }
    
    Alert.alert(title, `Tính năng "${title}" đang được phát triển.`);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        logout().then(() => router.replace("/login"));
      }
    } else {
      Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: async () => { await logout(); router.replace("/login"); } },
      ]);
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen} edges={["top", "left", "right"]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={dynamicStyles.scrollContent}>
        
        <View style={dynamicStyles.header}>
          <View style={dynamicStyles.logoContainer}>
            <Text style={dynamicStyles.logo}>Beauty<Text style={dynamicStyles.logoAccent}>Tech.</Text></Text>
            <Text style={dynamicStyles.subtitle}>YOUR PERSONAL BEAUTY SPACE</Text>
          </View>
          <Pressable style={dynamicStyles.headerButton} onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications-outline" size={23} color={theme.primary} /><View style={dynamicStyles.notificationDot} />
          </Pressable>
        </View>

        <View style={dynamicStyles.profileCard}>
          <View style={dynamicStyles.profileTop}>
            <View style={dynamicStyles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={dynamicStyles.avatar} />
              ) : (
                <View style={[dynamicStyles.avatar, { backgroundColor: theme.isDark ? '#333' : '#FCE6EE', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.primary }}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={dynamicStyles.onlineDot} />
            </View>
            <View style={dynamicStyles.profileInfo}>
              <Text style={dynamicStyles.welcomeText}>XIN CHÀO, BEAUTY!</Text>
              <Text style={dynamicStyles.profileName}>{user?.fullName || "Người dùng BeautyTech"}</Text>
              <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>{user?.email}</Text>
            </View>
          </View>
          <View style={dynamicStyles.profileDivider} />
          
          <View style={dynamicStyles.statsRow}>
            <View style={dynamicStyles.statItem}>
              <Ionicons name="bag-handle-outline" size={20} color={theme.primary} />
              <Text style={dynamicStyles.statNumber}>{orderCount}</Text>
              <Text style={dynamicStyles.statLabel}>Đơn hàng</Text>
            </View>
            <View style={dynamicStyles.statDivider} />
            <View style={dynamicStyles.statItem}>
              <Ionicons name="heart-outline" size={20} color={theme.primary} />
              {/* 👇 LẤY TRỰC TIẾP TỪ CONTEXT */}
              <Text style={dynamicStyles.statNumber}>{wishlistIds.length}</Text> 
              <Text style={dynamicStyles.statLabel}>Yêu thích</Text>
            </View>
            <View style={dynamicStyles.statDivider} />
            <View style={dynamicStyles.statItem}>
              <Ionicons name="scan-outline" size={20} color={theme.primary} />
              <Text style={dynamicStyles.statNumber}>{diaryCount}</Text>
              <Text style={dynamicStyles.statLabel}>Lần soi da</Text>
            </View>
          </View>
        </View>

        <View style={dynamicStyles.themeToggleCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={dynamicStyles.menuIcon}><Ionicons name={theme.isDark ? "moon" : "sunny"} size={22} color={theme.primary} /></View>
            <Text style={dynamicStyles.menuTitle}>Chế độ tối (Dark Mode)</Text>
          </View>
          <Switch 
            value={theme.isDark} 
            onValueChange={toggleTheme} 
            trackColor={{ false: "#E0E0E0", true: "#BC6280" }}
            thumbColor={Platform.OS === 'android' ? "#FFF" : ""}
          />
        </View>

        <Pressable style={dynamicStyles.aiBanner} onPress={() => router.push("/chat")}>
          <View style={dynamicStyles.aiIcon}><Ionicons name="chatbubbles" size={27} color="#FFFFFF" /></View>
          <View style={dynamicStyles.aiContent}>
            <Text style={dynamicStyles.aiEyebrow}>BEAUTYTECH AI</Text>
            <Text style={dynamicStyles.aiTitle}>Trò chuyện cùng chuyên gia AI</Text>
            <Text style={dynamicStyles.aiDescription}>Nhận lời khuyên chăm sóc da cá nhân hóa.</Text>
          </View>
          <Ionicons name="chevron-forward" size={21} color={theme.primary} />
        </Pressable>

        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>Quản lý tài khoản</Text><Text style={dynamicStyles.sectionCaption}>PERSONAL SETTINGS</Text>
        </View>
        <View style={dynamicStyles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={item.title}>
              <Pressable style={dynamicStyles.menuItem} onPress={() => handleMenuPress(item.title)}>
                <View style={dynamicStyles.menuIcon}><Ionicons name={item.icon} size={22} color={theme.primary} /></View>
                <View style={dynamicStyles.menuContent}><Text style={dynamicStyles.menuTitle}>{item.title}</Text><Text style={dynamicStyles.menuSubtitle}>{item.subtitle}</Text></View>
                <Ionicons name="chevron-forward" size={19} color={theme.textMuted} />
              </Pressable>
              {index < menuItems.length - 1 && (<View style={dynamicStyles.menuDivider} />)}
            </View>
          ))}
        </View>

        <Pressable style={dynamicStyles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={21} color="#FF6B6B" /><Text style={[dynamicStyles.logoutText, { color: '#FF6B6B' }]}>Đăng xuất</Text>
        </Pressable>
      </ScrollView>

      <View style={dynamicStyles.bottomNav}>
        <Pressable style={dynamicStyles.navItem} onPress={() => router.replace("/home")}>
          <Ionicons name="home-outline" size={22} color={theme.textMuted} /><Text style={dynamicStyles.navText}>Trang chủ</Text>
        </Pressable>
        <Pressable style={dynamicStyles.navItem} onPress={() => router.replace("/products")}>
          <Ionicons name="grid-outline" size={22} color={theme.textMuted} /><Text style={dynamicStyles.navText}>Sản phẩm</Text>
        </Pressable>
        <Pressable style={dynamicStyles.navItem} onPress={() => router.replace("/chat")}>
          <Ionicons name="chatbubbles-outline" size={22} color={theme.textMuted} /><Text style={dynamicStyles.navText}>Chat AI</Text>
        </Pressable>
        <Pressable style={dynamicStyles.navItem} onPress={() => router.replace("/diary")}>
          <Ionicons name="time-outline" size={22} color={theme.textMuted} /><Text style={dynamicStyles.navText}>Nhật ký da</Text>
        </Pressable>
        <Pressable style={dynamicStyles.navItem}>
          <Ionicons name="person" size={22} color={theme.primary} /><Text style={dynamicStyles.navActiveText}>Tài khoản</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 105 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 25 },
  logoContainer: { alignItems: "center", justifyContent: "center", width: "100%" },
  logo: { fontSize: 27, fontWeight: "800", color: theme.text, letterSpacing: -0.8, textAlign: "center" },
  logoAccent: { color: theme.primary },
  subtitle: { fontSize: 8, letterSpacing: 1.5, color: theme.textMuted, textAlign: "center", marginTop: 3 },
  headerButton: { position: "absolute", right: 0, top: 10, width: 42, height: 42, borderRadius: 21, backgroundColor: theme.isDark ? '#2A2A2A' : "#FFF0F5", alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: "#D85D85" },
  profileCard: { backgroundColor: theme.card, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 17, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  profileTop: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { position: "relative" },
  avatar: { width: 65, height: 65, borderRadius: 23 },
  onlineDot: { position: "absolute", right: -2, bottom: 1, width: 15, height: 15, borderRadius: 8, backgroundColor: "#85B89A", borderWidth: 3, borderColor: theme.card },
  profileInfo: { flex: 1, marginLeft: 13 },
  welcomeText: { fontSize: 9, color: theme.primary, fontWeight: "800", letterSpacing: 1 },
  profileName: { fontSize: 17, fontWeight: "800", color: theme.text, marginTop: 5 },
  profileDivider: { height: 1, backgroundColor: theme.border, marginVertical: 17 },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  statItem: { flex: 1, alignItems: "center", gap: 5 },
  statNumber: { fontSize: 17, fontWeight: "800", color: theme.text },
  statLabel: { fontSize: 10, color: theme.textMuted },
  statDivider: { width: 1, height: 43, backgroundColor: theme.border },
  themeToggleCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: theme.card, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 10, borderWidth: 1, borderColor: theme.border, marginBottom: 15 },
  menuIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: theme.isDark ? '#333' : "#FBEFF3", alignItems: "center", justifyContent: "center" },
  menuTitle: { fontSize: 14, fontWeight: "800", color: theme.text },
  aiBanner: { flexDirection: "row", alignItems: "center", backgroundColor: theme.isDark ? '#2C1F23' : "#F9E9EE", borderRadius: 19, padding: 15, marginBottom: 25, gap: 12 },
  aiIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center" },
  aiContent: { flex: 1 },
  aiEyebrow: { fontSize: 9, fontWeight: "800", letterSpacing: 1.3, color: theme.primary },
  aiTitle: { fontSize: 13, fontWeight: '800', color: theme.text, marginTop: 4 },
  aiDescription: { fontSize: 10, color: theme.textMuted, marginTop: 4 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: theme.text },
  sectionCaption: { fontSize: 8, fontWeight: "700", letterSpacing: 1, color: theme.textMuted },
  menuCard: { backgroundColor: theme.card, borderRadius: 20, paddingHorizontal: 13, borderWidth: 1, borderColor: theme.border },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  menuContent: { flex: 1 },
  menuSubtitle: { fontSize: 10, color: theme.textMuted, marginTop: 5 },
  menuDivider: { height: 1, backgroundColor: theme.border, marginLeft: 54 },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 47, borderRadius: 15, borderWidth: 1, borderColor: "#FF6B6B", backgroundColor: theme.isDark ? '#331111' : "#FFF5F7", marginTop: 20 },
  logoutText: { fontSize: 12, fontWeight: "800" },
  bottomNav: { position: "absolute", bottom: 0, left: 0, right: 0, height: 72, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 2, paddingBottom: 5, elevation: 12 },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 5 },
  navText: { fontSize: 9, fontWeight: "600", color: theme.textMuted, textAlign: "center" },
  navActiveText: { fontSize: 9, fontWeight: "800", color: theme.primary, textAlign: "center" },
});