import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { useCart } from "../presentation/contexts/CartContext";

const categories = [
  { name: "Làm sạch", icon: "water-outline" as const },
  { name: "Serum", icon: "flask-outline" as const },
  { name: "Dưỡng ẩm", icon: "flower-outline" as const },
  { name: "Chống nắng", icon: "sunny-outline" as const },
];

const products = [
  { name: "Glow Serum", detail: "Serum dưỡng sáng da", price: "259.000đ", oldPrice: "320.000đ", image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80", color: "#F8E4E9", tag: "BÁN CHẠY" },
  { name: "Hydra Cream", detail: "Kem dưỡng ẩm sâu", price: "320.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80", color: "#F5EBDD", tag: "YÊU THÍCH" },
  { name: "Pure Cleanser", detail: "Sữa rửa mặt dịu nhẹ", price: "189.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&auto=format&fit=crop&q=80", color: "#E8EDE4", tag: "MỚI" },
  { name: "Daily Sunscreen", detail: "Kem chống nắng SPF 50+", price: "285.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80", color: "#F8EAD7", tag: "NỔI BẬT" },
  { name: "Rose Toner", detail: "Nước cân bằng da dịu nhẹ", price: "199.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&auto=format&fit=crop&q=80", color: "#F8E4E9", tag: "BÁN CHẠY" },
  { name: "Vitamin C Serum", detail: "Serum vitamin C chăm sóc da", price: "349.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80", color: "#F5EBDD", tag: "NỔI BẬT" },
  { name: "Soft Cleansing Oil", detail: "Dầu tẩy trang làm sạch", price: "229.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80", color: "#E8EDE4", tag: "MỚI" },
  { name: "Repair Night Cream", detail: "Kem dưỡng da ban đêm", price: "389.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600&auto=format&fit=crop&q=80", color: "#F8EAD7", tag: "YÊU THÍCH" },
  { name: "Lip Care Balm", detail: "Son dưỡng môi mềm mịn", price: "129.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80", color: "#F8E4E9", tag: "MỚI" },
  { name: "Hydrating Face Mask", detail: "Mặt nạ cấp ẩm cho da", price: "79.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&auto=format&fit=crop&q=80", color: "#E8EDE4", tag: "GIÁ TỐT" },
  { name: "Eye Repair Cream", detail: "Kem dưỡng vùng da quanh mắt", price: "299.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80", color: "#F5EBDD", tag: "YÊU THÍCH" },
  { name: "Body Lotion", detail: "Sữa dưỡng thể mềm mịn", price: "219.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&auto=format&fit=crop&q=80", color: "#F8EAD7", tag: "NỔI BẬT" },
];

function productCategory(name: string) {
  if (name.includes("Serum")) return "Serum";
  if (name.includes("Cream") || name.includes("Lotion")) return "Dưỡng ẩm";
  if (name.includes("Cleanser") || name.includes("Cleansing") || name.includes("Toner")) return "Làm sạch";
  if (name.includes("Sunscreen")) return "Chống nắng";
  return "";
}

export default function HomeScreen() {
  const router = useRouter();
  const { cart } = useCart(); // Lấy data giỏ hàng
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !keyword || `${product.name} ${product.detail}`.toLowerCase().includes(keyword);
      const matchesCategory = !selectedCategory || productCategory(product.name) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const toggleFavorite = (name: string) => {
    setFavorites((previous) =>
      previous.includes(name) ? previous.filter((item) => item !== name) : [...previous, name],
    );
  };

  // Đếm tổng số lượng món đồ trong giỏ để hiện lên icon
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFAF8" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Beauty<Text style={styles.logoAccent}>Tech.</Text></Text>
            <Text style={styles.logoSubtitle}>YOUR PERSONAL BEAUTY SPACE</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerIcon} onPress={() => router.replace("/account")}>
              <Ionicons name="person-outline" size={21} color="#49333B" />
            </Pressable>
            {/* Nút giỏ hàng chuyển sang trang Cart */}
            <Pressable style={styles.headerIcon} onPress={() => router.push('/cart')}>
              <Ionicons name="bag-handle-outline" size={21} color="#49333B" />
              {totalCartItems > 0 ? (
                <View style={styles.cartCount}>
                  <Text style={styles.cartCountText}>{totalCartItems}</Text>
                </View>
              ) : (
                <View style={styles.cartDot} />
              )}
            </Pressable>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#A58B93" />
          <TextInput
            placeholder="Tìm sản phẩm chăm sóc da..."
            placeholderTextColor="#AD9AA0"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          <Pressable
            onPress={() => {
              const allCategories = ["", ...categories.map((item) => item.name)];
              const currentIndex = allCategories.indexOf(selectedCategory);
              setSelectedCategory(allCategories[(currentIndex + 1) % allCategories.length]);
            }}
            style={styles.filterButton}
          >
            <Ionicons name="options-outline" size={19} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* HERO BANNER */}
        <View style={styles.hero}>
          <View style={styles.heroTextContent}>
            <View style={styles.heroLabel}>
              <Ionicons name="sparkles" size={12} color="#A74D6D" />
              <Text style={styles.heroLabelText}>BEAUTY FOR YOU</Text>
            </View>
            <Text style={styles.heroTitle}>Yêu làn da,{"\n"}yêu chính mình.</Text>
            <Text style={styles.heroDescription}>Chọn đúng sản phẩm.{"\n"}Tỏa sáng theo cách của bạn.</Text>
            <Pressable style={styles.heroButton} onPress={() => router.replace("/products")}>
              <Text style={styles.heroButtonText}>Khám phá ngay</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.heroDecoration}>
            <View style={styles.heroCircle}>
              <Text style={styles.heroEmoji}>🌷</Text>
            </View>
            <View style={styles.heroSparkle}>
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.heroSmallCircle} />
          </View>
          <View style={styles.heroPageIndicator}>
            <View style={styles.indicatorActive} />
            <View style={styles.indicatorInactive} />
            <View style={styles.indicatorInactive} />
          </View>
        </View>

        {/* BENEFITS */}
        <View style={styles.benefits}>
          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#BA6380" />
            <Text style={styles.benefitText}>Chọn lọc kỹ</Text>
          </View>
          <View style={styles.benefitDivider} />
          <View style={styles.benefitItem}>
            <Ionicons name="leaf-outline" size={20} color="#BA6380" />
            <Text style={styles.benefitText}>Chăm da dịu nhẹ</Text>
          </View>
          <View style={styles.benefitDivider} />
          <View style={styles.benefitItem}>
            <Ionicons name="heart-outline" size={20} color="#BA6380" />
            <Text style={styles.benefitText}>Yêu bản thân</Text>
          </View>
        </View>

        {/* CATEGORIES */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>Khám phá danh mục</Text>
              <Text style={styles.sectionSubtitle}>Chăm sóc làn da mỗi ngày</Text>
            </View>
            <Ionicons name="arrow-forward-circle-outline" size={27} color="#B65D7B" />
          </View>

          <View style={styles.categoryGrid}>
            {categories.map((category, index) => (
              <Pressable
                key={category.name}
                style={styles.categoryItem}
                onPress={() => setSelectedCategory((current) => current === category.name ? "" : category.name)}
              >
                <View
                  style={[
                    styles.categoryCircle,
                    {
                      backgroundColor: ["#F7E4E9", "#F5EBDD", "#E9EDE4", "#F8E9D6"][index],
                      borderWidth: selectedCategory === category.name ? 2 : 0,
                      borderColor: "#BC6280",
                    },
                  ]}
                >
                  <Ionicons name={category.icon} size={27} color="#A65B75" />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* AI SKIN ANALYSIS */}
        <View style={styles.aiCard}>
          <View style={styles.aiTopRow}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              <Text style={styles.aiBadgeText}>BEAUTYTECH AI</Text>
            </View>
            <Ionicons name="scan-outline" size={27} color="#B86D80" />
          </View>
          <Text style={styles.aiTitle}>Làn da của bạn,{"\n"}câu chuyện của riêng bạn.</Text>
          <Text style={styles.aiDescription}>Khám phá đặc điểm làn da và nhận gợi ý chăm sóc phù hợp với bạn.</Text>
          <Pressable style={styles.aiButton} onPress={() => router.replace("/chat")}>
            <Text style={styles.aiButtonText}>Tư vấn cùng AI</Text>
            <Ionicons name="chatbubbles" size={16} color="#FFFFFF" />
          </Pressable>
          <View style={styles.aiDecorationOne} />
          <View style={styles.aiDecorationTwo} />
        </View>

        {/* PRODUCTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionTitle}>Được yêu thích</Text>
              <Text style={styles.sectionSubtitle}>Những lựa chọn dành cho bạn</Text>
            </View>
            <Pressable onPress={() => { setSearch(""); setSelectedCategory(""); }}>
              <Text style={styles.seeAll}>Xóa bộ lọc</Text>
            </Pressable>
          </View>

          <View style={styles.productGrid}>
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyResults}>
                <Ionicons name="search-outline" size={28} color="#A58B93" />
                <Text style={styles.emptyResultsText}>Không tìm thấy sản phẩm phù hợp.</Text>
                <Pressable onPress={() => { setSearch(""); setSelectedCategory(""); }}>
                  <Text style={styles.seeAll}>Xóa bộ lọc</Text>
                </Pressable>
              </View>
            ) : (
              filteredProducts.map((product) => (
                <Pressable
                  key={product.name}
                  style={styles.productCard}
                  onPress={() => router.push({ pathname: "/product-detail", params: { name: product.name, detail: product.detail, price: product.price, image: product.image, tag: product.tag } })}
                >
                  <View style={[styles.productImage, { backgroundColor: product.color }]}>
                    <Image source={{ uri: product.image }} style={styles.productPhoto} resizeMode="cover" />
                    <View style={styles.productTag}>
                      <Text style={styles.productTagText}>{product.tag}</Text>
                    </View>
                    <Pressable style={styles.favoriteButton} onPress={() => toggleFavorite(product.name)}>
                      <Ionicons name={favorites.includes(product.name) ? "heart" : "heart-outline"} size={18} color="#A65370" />
                    </Pressable>
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productDetail}>{product.detail}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>{product.price}</Text>
                      {product.oldPrice ? <Text style={styles.oldPrice}>{product.oldPrice}</Text> : null}
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* THANH ĐIỀU HƯỚNG DƯỚI */}
      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.replace("/home")}>
          <Ionicons name="home" size={22} color="#BC6280" />
          <Text style={styles.navActiveText}>Trang chủ</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace("/products")}>
          <Ionicons name="bag-outline" size={22} color="#A58B93" />
          <Text style={styles.navText}>Sản phẩm</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace("/chat")}>
          <Ionicons name="chatbubbles-outline" size={22} color="#A58B93" />
          <Text style={styles.navText}>Chat AI</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace("/diary")}>
          <Ionicons name="time-outline" size={22} color="#A58B93" />
          <Text style={styles.navText}>Nhật ký da</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.replace("/account")}>
          <Ionicons name="person-outline" size={22} color="#A58B93" />
          <Text style={styles.navText}>Tài khoản</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFAF8" },
  scrollContent: { paddingBottom: 150 },
  header: { paddingTop: 53, paddingHorizontal: 22, paddingBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { fontSize: 25, fontWeight: "900", letterSpacing: -1, color: "#49313C" },
  logoAccent: { color: "#C15E80" },
  logoSubtitle: { marginTop: 3, color: "#A78B96", fontSize: 8, letterSpacing: 1.5, fontWeight: "700" },
  headerActions: { flexDirection: "row", gap: 10 },
  headerIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: "#F8EDF0", alignItems: "center", justifyContent: "center" },
  cartCount: { position: "absolute", right: 5, top: 4, minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: 8, backgroundColor: "#C15E80", alignItems: "center", justifyContent: "center" },
  cartCountText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  cartDot: { position: "absolute", right: 9, top: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: "#C15E80" },
  searchBox: { marginHorizontal: 22, height: 51, paddingLeft: 15, paddingRight: 6, borderRadius: 16, backgroundColor: "#F5ECEF", flexDirection: "row", alignItems: "center", gap: 9 },
  searchInput: { flex: 1, fontSize: 12, color: "#49313C", paddingVertical: 8 },
  filterButton: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#BC6280" },
  hero: { marginHorizontal: 22, marginTop: 23, minHeight: 247, borderRadius: 26, paddingTop: 22, paddingHorizontal: 20, paddingBottom: 29, backgroundColor: "#F4DDE5", overflow: "hidden" },
  heroTextContent: { zIndex: 2, alignItems: "flex-start" },
  heroLabel: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FFFFFFA8", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20 },
  heroLabelText: { fontSize: 9, fontWeight: "800", color: "#A74D6D", letterSpacing: 1 },
  heroTitle: { marginTop: 14, fontSize: 27, lineHeight: 34, fontWeight: "900", color: "#563543", letterSpacing: -0.6 },
  heroDescription: { marginTop: 8, fontSize: 11, lineHeight: 17, color: "#866472" },
  heroButton: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 15, paddingHorizontal: 15, paddingVertical: 11, backgroundColor: "#B95E7D", borderRadius: 12 },
  heroButtonText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  heroDecoration: { position: "absolute", right: -4, top: 46, width: 145, height: 150, alignItems: "center", justifyContent: "center" },
  heroCircle: { width: 116, height: 116, borderRadius: 58, backgroundColor: "#F9EAF0", alignItems: "center", justifyContent: "center", borderWidth: 7, borderColor: "#FFFFFF70" },
  heroEmoji: { fontSize: 65 },
  heroSparkle: { position: "absolute", right: 12, top: 0, width: 37, height: 37, borderRadius: 14, backgroundColor: "#C57A94", alignItems: "center", justifyContent: "center" },
  heroSmallCircle: { position: "absolute", left: 0, bottom: 8, width: 17, height: 17, borderRadius: 9, backgroundColor: "#D6A1B2" },
  heroPageIndicator: { position: "absolute", left: 20, bottom: 12, flexDirection: "row", gap: 5 },
  indicatorActive: { width: 19, height: 5, borderRadius: 3, backgroundColor: "#B95E7D" },
  indicatorInactive: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#D7ACBC" },
  benefits: { marginTop: 21, marginHorizontal: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 17, paddingVertical: 15, paddingHorizontal: 10, borderWidth: 1, borderColor: "#F6EDEF" },
  benefitItem: { flex: 1, alignItems: "center", gap: 5 },
  benefitText: { fontSize: 9, color: "#755A65", fontWeight: "600", textAlign: "center" },
  benefitDivider: { width: 1, height: 30, backgroundColor: "#F0E4E8" },
  section: { marginTop: 30 },
  sectionHeading: { marginHorizontal: 22, marginBottom: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 19, fontWeight: "900", color: "#49313C", letterSpacing: -0.4 },
  sectionSubtitle: { marginTop: 5, fontSize: 11, color: "#A18A94" },
  categoryGrid: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 22 },
  categoryItem: { width: "23%", alignItems: "center" },
  categoryCircle: { width: 61, height: 61, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  categoryName: { fontSize: 10, fontWeight: "700", color: "#634A56", marginTop: 9, textAlign: "center" },
  aiCard: { position: "relative", overflow: "hidden", marginHorizontal: 22, marginTop: 31, borderRadius: 24, backgroundColor: "#F5E8DF", padding: 20 },
  aiTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#B66D7D", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9 },
  aiBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  aiTitle: { marginTop: 17, fontSize: 23, lineHeight: 30, fontWeight: "900", color: "#563C43", letterSpacing: -0.4 },
  aiDescription: { maxWidth: "90%", marginTop: 8, fontSize: 11, lineHeight: 18, color: "#876B70" },
  aiButton: { alignSelf: "flex-start", marginTop: 17, backgroundColor: "#B66D7D", paddingHorizontal: 15, paddingVertical: 11, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 9 },
  aiButtonText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  aiDecorationOne: { position: "absolute", right: -30, bottom: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: "#E7C7C7", opacity: 0.45 },
  aiDecorationTwo: { position: "absolute", right: 22, top: 68, width: 55, height: 55, borderRadius: 28, borderWidth: 1, borderColor: "#D2A7AA", opacity: 0.7 },
  seeAll: { fontSize: 11, fontWeight: "700", color: "#B65D7B" },
  productGrid: { marginHorizontal: 22, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  productCard: { width: "48%", marginBottom: 15, backgroundColor: "#FFFFFF", borderRadius: 19, padding: 9, borderWidth: 1, borderColor: "#F3E9EC" },
  productImage: { height: 140, borderRadius: 14, alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  productPhoto: { width: "100%", height: "100%", position: "absolute" },
  productTag: { position: "absolute", top: 9, left: 8, backgroundColor: "#FFFFFFD9", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 5, zIndex: 1 },
  productTagText: { fontSize: 7, fontWeight: "900", color: "#9D5870" },
  favoriteButton: { position: "absolute", top: 7, right: 7, width: 30, height: 30, borderRadius: 11, backgroundColor: "#FFFFFFD9", alignItems: "center", justifyContent: "center", zIndex: 1 },
  productInfo: { paddingHorizontal: 3, paddingTop: 11, paddingBottom: 3 },
  productName: { fontSize: 13, fontWeight: "900", color: "#49313C" },
  productDetail: { fontSize: 10, color: "#A18B94", marginTop: 5 },
  priceRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 9 },
  productPrice: { color: "#BC5E7E", fontWeight: "900", fontSize: 13 },
  oldPrice: { color: "#B6A7AD", fontSize: 9, textDecorationLine: "line-through" },
  emptyResults: { width: "100%", alignItems: "center", justifyContent: "center", paddingVertical: 28, gap: 10 },
  emptyResultsText: { color: "#A18A94", fontSize: 11, textAlign: "center" },
  bottomNav: { position: "absolute", bottom: 0, left: 0, right: 0, height: 70, backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#F2E4E9", flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 5, paddingBottom: 5, elevation: 12, shadowColor: "#8D5368", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 8 },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 5 },
  navActiveText: { fontSize: 10, fontWeight: "800", color: "#BC6280" },
  navText: { fontSize: 10, fontWeight: "600", color: "#A58B93" },
});