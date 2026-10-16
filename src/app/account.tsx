import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const menuItems = [
  {
    icon: "person-outline" as const,
    title: "Chỉnh sửa hồ sơ",
    subtitle: "Cập nhật thông tin cá nhân",
  },
  {
    icon: "receipt-outline" as const,
    title: "Đơn hàng của tôi",
    subtitle: "Theo dõi đơn hàng đã đặt",
  },
  {
    icon: "heart-outline" as const,
    title: "Sản phẩm yêu thích",
    subtitle: "Danh sách mỹ phẩm yêu thích",
  },
  {
    icon: "location-outline" as const,
    title: "Địa chỉ giao hàng",
    subtitle: "Quản lý địa chỉ nhận hàng",
  },
  {
    icon: "notifications-outline" as const,
    title: "Thông báo",
    subtitle: "Ưu đãi và cập nhật mới",
  },
  {
    icon: "settings-outline" as const,
    title: "Cài đặt",
    subtitle: "Tùy chỉnh tài khoản của bạn",
  },
];

export default function AccountScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleMenuPress = (title: string) => {
    if (title === "Chỉnh sửa hồ sơ") {
      Alert.alert(
        "Chỉnh sửa hồ sơ",
        "Tính năng cập nhật hồ sơ sẽ được phát triển tiếp."
      );
      return;
    }

    if (title === "Đơn hàng của tôi") {
      Alert.alert("Đơn hàng", "Bạn chưa có đơn hàng nào.");
      return;
    }

    if (title === "Sản phẩm yêu thích") {
      Alert.alert(
        "Sản phẩm yêu thích",
        "Danh sách yêu thích sẽ được đồng bộ ở phiên bản tiếp theo."
      );
      return;
    }

    Alert.alert(title, `Tính năng "${title}" sẽ được phát triển tiếp.`);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          setIsLoggedIn(false);
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFAF8" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        
<View style={styles.header}>
  <View style={styles.logoContainer}>
    <Text style={styles.logo}>
      Beauty<Text style={styles.logoAccent}>Tech.</Text>
    </Text>

    <Text style={styles.subtitle}>
      YOUR PERSONAL BEAUTY SPACE
    </Text>
  </View>

  <Pressable
    style={styles.headerButton}
    onPress={() =>
      Alert.alert("Thông báo", "Bạn chưa có thông báo mới.")
    }
  >
    <Ionicons
      name="notifications-outline"
      size={23}
      color="#BC6280"
    />
    <View style={styles.notificationDot} />
  </Pressable>
</View>




        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
                }}
                style={styles.avatar}
              />
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>XIN CHÀO, BEAUTY!</Text>
              <Text style={styles.profileName}>
                {isLoggedIn ? "Người dùng BeautyTech" : "Khách hàng"}
              </Text>
              
            </View>

            <Pressable
              style={styles.editIconButton}
              onPress={() => handleMenuPress("Chỉnh sửa hồ sơ")}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color="#BC6280"
              />
            </Pressable>
          </View>

          <View style={styles.profileDivider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="bag-handle-outline"
                size={20}
                color="#BC6280"
              />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons
                name="heart-outline"
                size={20}
                color="#BC6280"
              />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Yêu thích</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons
                name="scan-outline"
                size={20}
                color="#BC6280"
              />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Lần soi da</Text>
            </View>
          </View>

         
        </View>

        {/* Beauty AI banner */}
        <Pressable
          style={styles.aiBanner}
          onPress={() => router.push("/login")}
        >
          <View style={styles.aiIcon}>
            <Ionicons name="scan-outline" size={27} color="#FFFFFF" />
          </View>

          <View style={styles.aiContent}>
            <Text style={styles.aiEyebrow}>BEAUTYTECH AI</Text>
            <Text style={styles.aiTitle}>Khám phá làn da của bạn</Text>
            <Text style={styles.aiDescription}>
              Trải nghiệm phân tích da thông minh.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#BC6280"
          />
        </Pressable>

        {/* Menu */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quản lý tài khoản</Text>
          <Text style={styles.sectionCaption}>PERSONAL SETTINGS</Text>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={item.title}>
              <Pressable
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.title)}
              >
                <View style={styles.menuIcon}>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color="#BC6280"
                  />
                </View>

                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>
                    {item.subtitle}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#C6A9B4"
                />
              </Pressable>

              {index < menuItems.length - 1 && (
                <View style={styles.menuDivider} />
              )}
            </View>
          ))}
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={21} color="#C45F83" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>

        <Text style={styles.versionText}>BEAUTYTECH · BEAUTY WITH CARE</Text>
        <Text style={styles.versionNumber}>Phiên bản 1.0.0</Text>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/home")}
        >
          <Ionicons name="home-outline" size={22} color="#A58B93" />
          <Text style={styles.navText}>Trang chủ</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/products")}
        >
          <Ionicons name="grid-outline" size={22} color="#A58B93" />
          <Text style={styles.navText}>Sản phẩm</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/login")}
        >
          <Ionicons name="scan-outline" size={22} color="#A58B93" />
          <Text style={styles.navText}>Beauty AI</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/login")}
        >
          <Ionicons name="time-outline" size={22} color="#A58B93" />
          <Text style={styles.navText}>Nhật ký da</Text>
        </Pressable>

        <Pressable style={styles.navItem}>
          <Ionicons name="person" size={22} color="#BC6280" />
          <Text style={styles.navActiveText}>Tài khoản</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFAF8",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 105,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  logoContainer: {
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
},
  logo: {
    fontSize: 27,
    fontWeight: "800",
    color: "#45323A",
    letterSpacing: -0.8,
    textAlign: "center",
    
  },
  logoAccent: {
    color: "#D76F91",
  },
  subtitle: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: "#B58A99",
    textAlign: "center",
    marginTop: 3,
  },
 headerButton: {
  position: "absolute",
  right: 0,
  top: 10,
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "#FFF0F5",
  alignItems: "center",
  justifyContent: "center",
},
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D85D85",
  },
  titleArea: {
    marginBottom: 20,
  },
  eyebrow: {
    color: "#C17B96",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 7,
  },
  pageTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#49323B",
  },
  description: {
    fontSize: 12,
    color: "#9E858F",
    marginTop: 7,
    lineHeight: 18,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F2E2E8",
    marginBottom: 17,
    shadowColor: "#9B6177",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 23,
    backgroundColor: "#F8E4E9",
  },
  onlineDot: {
    position: "absolute",
    right: -2,
    bottom: 1,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#85B89A",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 13,
  },
  welcomeText: {
    fontSize: 9,
    color: "#C17B96",
    fontWeight: "800",
    letterSpacing: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#49323B",
    marginTop: 5,
  },
  profileEmail: {
    fontSize: 10,
    color: "#A58B93",
    marginTop: 5,
  },
  editIconButton: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "#F9E9EE",
    justifyContent: "center",
    alignItems: "center",
  },
  profileDivider: {
    height: 1,
    backgroundColor: "#F4E8EC",
    marginVertical: 17,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  statNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: "#49323B",
  },
  statLabel: {
    fontSize: 10,
    color: "#A58B93",
  },
  statDivider: {
    width: 1,
    height: 43,
    backgroundColor: "#F1E3E8",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    height: 45,
    borderRadius: 14,
    backgroundColor: "#C87391",
    marginTop: 17,
  },
  loginButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9E9EE",
    borderRadius: 19,
    padding: 15,
    marginBottom: 25,
    gap: 12,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#C87391",
    alignItems: "center",
    justifyContent: "center",
  },
  aiContent: {
    flex: 1,
  },
  aiEyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: "#BC6280",
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#49323B",
    marginTop: 4,
  },
  aiDescription: {
    fontSize: 10,
    color: "#9E858F",
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#49323B",
  },
  sectionCaption: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#C19AA9",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#F2E5EA",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FBEFF3",
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#49323B",
  },
  menuSubtitle: {
    fontSize: 10,
    color: "#A58B93",
    marginTop: 5,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F6EBEF",
    marginLeft: 54,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 47,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F0D8E1",
    backgroundColor: "#FFF5F7",
    marginTop: 20,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#C45F83",
  },
  versionText: {
    textAlign: "center",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#C19AA9",
    marginTop: 23,
  },
  versionNumber: {
    textAlign: "center",
    fontSize: 10,
    color: "#BDAAB1",
    marginTop: 6,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F2E4E9",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 2,
    paddingBottom: 5,
    elevation: 12,
    shadowColor: "#8D5368",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  navText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#A58B93",
    textAlign: "center",
  },
  navActiveText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#BC6280",
    textAlign: "center",
  },
});