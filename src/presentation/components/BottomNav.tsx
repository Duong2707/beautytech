import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useTheme } from "../contexts/ThemeContext";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const styles = getStyles(theme);

  // Hàm kiểm tra xem tab nào đang được chọn
  const isActive = (path: string) => pathname === path;

  return (
    <View style={styles.bottomNav}>
      {/* Tab Trang chủ */}
      <Pressable style={styles.navItem} onPress={() => router.replace("/home")}>
        <Ionicons name="home" size={22} color={isActive("/home") ? theme.primary : theme.textMuted} />
        <Text style={[styles.navText, isActive("/home") && styles.navActiveText]}>Trang chủ</Text>
      </Pressable>

      {/* Tab Sản phẩm */}
      <Pressable style={styles.navItem} onPress={() => router.replace("/products")}>
        <Ionicons name="grid-outline" size={22} color={isActive("/products") ? theme.primary : theme.textMuted} />
        <Text style={[styles.navText, isActive("/products") && styles.navActiveText]}>Sản phẩm</Text>
      </Pressable>

      {/* Tab Chat AI */}
      <Pressable style={styles.navItem} onPress={() => router.replace("/chat")}>
        <Ionicons name="chatbubbles-outline" size={22} color={isActive("/chat") ? theme.primary : theme.textMuted} />
        <Text style={[styles.navText, isActive("/chat") && styles.navActiveText]}>Chat AI</Text>
      </Pressable>

      {/* Tab Nhật ký */}
      <Pressable style={styles.navItem} onPress={() => router.replace("/diary")}>
        <Ionicons name="time-outline" size={22} color={isActive("/diary") ? theme.primary : theme.textMuted} />
        <Text style={[styles.navText, isActive("/diary") && styles.navActiveText]}>Nhật ký da</Text>
      </Pressable>

      {/* Tab Tài khoản */}
      <Pressable style={styles.navItem} onPress={() => router.replace("/account")}>
        <Ionicons name="person-outline" size={22} color={isActive("/account") ? theme.primary : theme.textMuted} />
        <Text style={[styles.navText, isActive("/account") && styles.navActiveText]}>Tài khoản</Text>
      </Pressable>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  bottomNav: { 
    position: "absolute", bottom: 0, left: 0, right: 0, height: 72, 
    backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border, 
    flexDirection: "row", justifyContent: "space-around", alignItems: "center", 
    paddingHorizontal: 2, paddingBottom: 5, elevation: 12 
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 5 },
  navText: { fontSize: 9, fontWeight: "600", color: theme.textMuted, textAlign: "center" },
  navActiveText: { fontSize: 9, fontWeight: "800", color: theme.primary, textAlign: "center" },
});