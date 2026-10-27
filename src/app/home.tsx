import { useMemo, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, Platform, Modal } from "react-native";
import { useCart } from "../presentation/contexts/CartContext";
import { useTheme } from "../presentation/contexts/ThemeContext";
import BottomNav from "../presentation/components/BottomNav"; 

const categories = [
  { name: "Làm sạch", icon: "water-outline" as const },
  { name: "Serum", icon: "flask-outline" as const },
  { name: "Dưỡng ẩm", icon: "flower-outline" as const },
  { name: "Chống nắng", icon: "sunny-outline" as const },
  { name: "Trị mụn", icon: "bandage-outline" as const },
  { name: "Tẩy da chết", icon: "sparkles-outline" as const },
  { name: "Mặt nạ", icon: "happy-outline" as const },
  { name: "Xịt khoáng", icon: "rainy-outline" as const },
];

const products = [
  { name: "Glow Serum", detail: "Serum dưỡng sáng da", price: "259.000đ", priceValue: 259000, oldPrice: "320.000đ", image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80", color: "#F8E4E9", tag: "BÁN CHẠY", brand: "BeautyTech", rating: 4.9 },
  { name: "Hydra Cream", detail: "Kem dưỡng ẩm sâu", price: "320.000đ", priceValue: 320000, oldPrice: "", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80", color: "#F5EBDD", tag: "YÊU THÍCH", brand: "Cerave", rating: 4.8 },
  { name: "Pure Cleanser", detail: "Sữa rửa mặt dịu nhẹ", price: "189.000đ", priceValue: 189000, oldPrice: "", image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&auto=format&fit=crop&q=80", color: "#E8EDE4", tag: "MỚI", brand: "Cetaphil", rating: 4.7 },
  { name: "Daily Sunscreen", detail: "Kem chống nắng SPF 50+", price: "285.000đ", priceValue: 285000, oldPrice: "", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80", color: "#F8EAD7", tag: "NỔI BẬT", brand: "La Roche-Posay", rating: 4.9 },
  { name: "Rose Toner", detail: "Nước cân bằng da dịu nhẹ", price: "199.000đ", priceValue: 199000, oldPrice: "", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&auto=format&fit=crop&q=80", color: "#F8E4E9", tag: "BÁN CHẠY", brand: "BeautyTech", rating: 4.5 },
  { name: "Vitamin C Serum", detail: "Serum vitamin C chăm sóc da", price: "349.000đ", priceValue: 349000, oldPrice: "", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80", color: "#F5EBDD", tag: "NỔI BẬT", brand: "Klairs", rating: 4.6 },
];

const brands = ["Tất cả", "BeautyTech", "Cerave", "Cetaphil", "La Roche-Posay", "Klairs"];

function productCategory(name: string) {
  if (name.includes("Serum")) return "Serum";
  if (name.includes("Cream") || name.includes("Lotion")) return "Dưỡng ẩm";
  if (name.includes("Cleanser") || name.includes("Cleansing") || name.includes("Toner")) return "Làm sạch";
  if (name.includes("Sunscreen")) return "Chống nắng";
  return "";
}

export default function HomeScreen() {
  const router = useRouter();
  const { cart } = useCart(); 
  const { theme } = useTheme(); 
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'under200' | '200to300' | 'above300'>('all');
  const [brandFilter, setBrandFilter] = useState<string>('Tất cả');
  const [ratingFilter, setRatingFilter] = useState<number>(0); 

  const categoryScrollRef = useRef<ScrollView>(null);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !keyword || `${product.name} ${product.detail}`.toLowerCase().includes(keyword);
      const matchesCategory = !selectedCategory || productCategory(product.name) === selectedCategory;
      
      let matchesPrice = true;
      if (priceFilter === 'under200') matchesPrice = product.priceValue < 200000;
      else if (priceFilter === '200to300') matchesPrice = product.priceValue >= 200000 && product.priceValue <= 300000;
      else if (priceFilter === 'above300') matchesPrice = product.priceValue > 300000;

      const matchesBrand = brandFilter === 'Tất cả' || product.brand === brandFilter;
      const matchesRating = product.rating >= ratingFilter;

      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesRating;
    });
  }, [search, selectedCategory, priceFilter, brandFilter, ratingFilter]);

  const toggleFavorite = (name: string) => {
    setFavorites((previous) => previous.includes(name) ? previous.filter((item) => item !== name) : [...previous, name]);
  };

  const resetFilters = () => {
    setPriceFilter('all');
    setBrandFilter('Tất cả');
    setRatingFilter(0);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.screen}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={dynamicStyles.scrollContent}>
        
        {/* HEADER */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.logo}>Beauty<Text style={dynamicStyles.logoAccent}>Tech.</Text></Text>
            <Text style={dynamicStyles.logoSubtitle}>YOUR PERSONAL BEAUTY SPACE</Text>
          </View>
          <View style={dynamicStyles.headerActions}>
            <Pressable style={dynamicStyles.headerIcon} onPress={() => router.replace("/account")}>
              <Ionicons name="person-outline" size={21} color={theme.text} />
            </Pressable>
            <Pressable style={dynamicStyles.headerIcon} onPress={() => router.push('/cart')}>
              <Ionicons name="bag-handle-outline" size={21} color={theme.text} />
              {totalCartItems > 0 ? (
                <View style={dynamicStyles.cartCount}><Text style={dynamicStyles.cartCountText}>{totalCartItems}</Text></View>
              ) : (<View style={dynamicStyles.cartDot} />)}
            </Pressable>
          </View>
        </View>

        {/* SEARCH & FILTER */}
        <View style={dynamicStyles.searchBox}>
          <Ionicons name="search-outline" size={20} color={theme.textMuted} />
          <TextInput
            placeholder="Tìm sản phẩm chăm sóc da..."
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
            style={dynamicStyles.searchInput}
          />
          <Pressable
            onPress={() => setIsFilterModalVisible(true)}
            style={dynamicStyles.filterButton}
          >
            <Ionicons name="options-outline" size={19} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* HERO BANNER */}
        <View style={dynamicStyles.hero}>
          <View style={dynamicStyles.heroTextContent}>
            <View style={dynamicStyles.heroLabel}>
              <Ionicons name="sparkles" size={12} color={theme.primary} />
              <Text style={dynamicStyles.heroLabelText}>BEAUTY FOR YOU</Text>
            </View>
            <Text style={dynamicStyles.heroTitle}>Yêu làn da,{"\n"}yêu chính mình.</Text>
            <Text style={dynamicStyles.heroDescription}>Chọn đúng sản phẩm.{"\n"}Tỏa sáng theo cách của bạn.</Text>
            <Pressable style={dynamicStyles.heroButton} onPress={() => router.push("/survey")}>
              <Text style={dynamicStyles.heroButtonText}>Khám phá ngay</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
          <View style={dynamicStyles.heroDecoration}>
            <View style={dynamicStyles.heroCircle}><Text style={dynamicStyles.heroEmoji}>🌷</Text></View>
            <View style={dynamicStyles.heroSparkle}><Ionicons name="sparkles" size={20} color="#FFFFFF" /></View>
          </View>
        </View>

        {/* BENEFITS */}
        <View style={dynamicStyles.benefits}>
          <View style={dynamicStyles.benefitItem}><Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} /><Text style={dynamicStyles.benefitText}>Chọn lọc kỹ</Text></View>
          <View style={dynamicStyles.benefitDivider} />
          <View style={dynamicStyles.benefitItem}><Ionicons name="leaf-outline" size={20} color={theme.primary} /><Text style={dynamicStyles.benefitText}>Chăm da dịu nhẹ</Text></View>
          <View style={dynamicStyles.benefitDivider} />
          <View style={dynamicStyles.benefitItem}><Ionicons name="heart-outline" size={20} color={theme.primary} /><Text style={dynamicStyles.benefitText}>Yêu bản thân</Text></View>
        </View>

        {/* CATEGORIES */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeading}>
            <View><Text style={dynamicStyles.sectionTitle}>Khám phá danh mục</Text><Text style={dynamicStyles.sectionSubtitle}>Chăm sóc làn da mỗi ngày</Text></View>
            
            <Pressable 
              onPress={() => categoryScrollRef.current?.scrollToEnd({ animated: true })}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="arrow-forward-circle-outline" size={27} color={theme.primary} />
            </Pressable>
          </View>

          <ScrollView 
            ref={categoryScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={dynamicStyles.categoryList}
          >
            {categories.map((category, index) => (
              <Pressable key={category.name} style={dynamicStyles.categoryItem} onPress={() => setSelectedCategory((current) => current === category.name ? "" : category.name)}>
                <View style={[dynamicStyles.categoryCircle, { backgroundColor: theme.isDark ? '#2A2A2A' : ["#F7E4E9", "#F5EBDD", "#E9EDE4", "#F8E9D6"][index % 4], borderWidth: selectedCategory === category.name ? 2 : 0, borderColor: theme.primary }]}>
                  <Ionicons name={category.icon} size={24} color={theme.primary} />
                </View>
                <Text style={dynamicStyles.categoryName} numberOfLines={1}>{category.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* AI SKIN ANALYSIS */}
        <View style={dynamicStyles.aiCard}>
          <View style={dynamicStyles.aiTopRow}>
            <View style={dynamicStyles.aiBadge}><Ionicons name="sparkles" size={13} color="#FFFFFF" /><Text style={dynamicStyles.aiBadgeText}>BEAUTYTECH AI</Text></View>
            <Ionicons name="scan-outline" size={27} color={theme.primary} />
          </View>
          <Text style={dynamicStyles.aiTitle}>Làn da của bạn,{"\n"}câu chuyện của riêng bạn.</Text>
          <Text style={dynamicStyles.aiDescription}>Khám phá đặc điểm làn da và nhận gợi ý chăm sóc phù hợp với bạn.</Text>
          <Pressable style={dynamicStyles.aiButton} onPress={() => router.replace("/chat")}>
            <Text style={dynamicStyles.aiButtonText}>Tư vấn cùng AI</Text>
            <Ionicons name="chatbubbles" size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* PRODUCTS */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeading}>
            <View><Text style={dynamicStyles.sectionTitle}>Được yêu thích</Text><Text style={dynamicStyles.sectionSubtitle}>Những lựa chọn dành cho bạn</Text></View>
          </View>
          
          {filteredProducts.length === 0 ? (
            <Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 20 }}>Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</Text>
          ) : (
            <View style={dynamicStyles.productGrid}>
              {filteredProducts.map((product) => (
                <Pressable key={product.name} style={dynamicStyles.productCard} onPress={() => router.push({ pathname: "/product-detail", params: { name: product.name, detail: product.detail, price: product.price, image: product.image, tag: product.tag } })}>
                  <View style={[dynamicStyles.productImage, { backgroundColor: theme.isDark ? '#333' : product.color }]}>
                    <Image source={{ uri: product.image }} style={dynamicStyles.productPhoto} resizeMode="cover" />
                    <View style={dynamicStyles.productTag}><Text style={dynamicStyles.productTagText}>{product.tag}</Text></View>
                  </View>
                  <View style={dynamicStyles.productInfo}>
                    <Text style={dynamicStyles.productName}>{product.name}</Text>
                    <Text style={dynamicStyles.productDetail}>{product.detail}</Text>
                    <View style={dynamicStyles.priceRow}><Text style={dynamicStyles.productPrice}>{product.price}</Text></View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav />

      {/* MODAL BỘ LỌC */}
      <Modal visible={isFilterModalVisible} transparent={true} animationType="slide">
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Bộ lọc sản phẩm</Text>
              <Pressable onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={dynamicStyles.filterLabel}>Mức giá:</Text>
              <View style={dynamicStyles.filterOptions}>
                 <Pressable style={[dynamicStyles.filterBtn, priceFilter === 'all' && dynamicStyles.filterBtnActive]} onPress={() => setPriceFilter('all')}><Text style={[dynamicStyles.filterBtnText, priceFilter === 'all' && dynamicStyles.filterBtnTextActive]}>Tất cả</Text></Pressable>
                 <Pressable style={[dynamicStyles.filterBtn, priceFilter === 'under200' && dynamicStyles.filterBtnActive]} onPress={() => setPriceFilter('under200')}><Text style={[dynamicStyles.filterBtnText, priceFilter === 'under200' && dynamicStyles.filterBtnTextActive]}>Dưới 200k</Text></Pressable>
                 <Pressable style={[dynamicStyles.filterBtn, priceFilter === '200to300' && dynamicStyles.filterBtnActive]} onPress={() => setPriceFilter('200to300')}><Text style={[dynamicStyles.filterBtnText, priceFilter === '200to300' && dynamicStyles.filterBtnTextActive]}>200k - 300k</Text></Pressable>
                 <Pressable style={[dynamicStyles.filterBtn, priceFilter === 'above300' && dynamicStyles.filterBtnActive]} onPress={() => setPriceFilter('above300')}><Text style={[dynamicStyles.filterBtnText, priceFilter === 'above300' && dynamicStyles.filterBtnTextActive]}>Trên 300k</Text></Pressable>
              </View>

              <Text style={dynamicStyles.filterLabel}>Thương hiệu:</Text>
              <View style={dynamicStyles.filterOptions}>
                {brands.map((brand) => (
                  <Pressable key={brand} style={[dynamicStyles.filterBtn, brandFilter === brand && dynamicStyles.filterBtnActive]} onPress={() => setBrandFilter(brand)}>
                    <Text style={[dynamicStyles.filterBtnText, brandFilter === brand && dynamicStyles.filterBtnTextActive]}>{brand}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={dynamicStyles.filterLabel}>Đánh giá:</Text>
              <View style={dynamicStyles.filterOptions}>
                 <Pressable style={[dynamicStyles.filterBtn, ratingFilter === 0 && dynamicStyles.filterBtnActive]} onPress={() => setRatingFilter(0)}>
                    <Text style={[dynamicStyles.filterBtnText, ratingFilter === 0 && dynamicStyles.filterBtnTextActive]}>Tất cả</Text>
                 </Pressable>
                 {[1, 2, 3, 4, 5].map((star) => (
                   <Pressable key={star} style={[dynamicStyles.filterBtn, dynamicStyles.starFilterBtn, ratingFilter === star && dynamicStyles.filterBtnActive]} onPress={() => setRatingFilter(star)}>
                     <Text style={[dynamicStyles.filterBtnText, ratingFilter === star && dynamicStyles.filterBtnTextActive]}>{star}</Text>
                     <Ionicons name="star" size={14} color={ratingFilter === star ? theme.primary : "#FFC107"} />
                   </Pressable>
                 ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Pressable style={dynamicStyles.clearFilterBtn} onPress={resetFilters}>
                <Text style={dynamicStyles.clearFilterText}>Xóa bộ lọc</Text>
              </Pressable>
              <Pressable style={dynamicStyles.applyFilterBtn} onPress={() => setIsFilterModalVisible(false)}>
                <Text style={dynamicStyles.applyFilterText}>Áp dụng</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingBottom: 150 },
  header: { paddingTop: 53, paddingHorizontal: 22, paddingBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logo: { fontSize: 25, fontWeight: "900", letterSpacing: -1, color: theme.text },
  logoAccent: { color: theme.primary },
  logoSubtitle: { marginTop: 3, color: theme.textMuted, fontSize: 8, letterSpacing: 1.5, fontWeight: "700" },
  headerActions: { flexDirection: "row", gap: 10 },
  headerIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: theme.isDark ? '#2A2A2A' : "#F8EDF0", alignItems: "center", justifyContent: "center" },
  cartCount: { position: "absolute", right: 5, top: 4, minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: 8, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center" },
  cartCountText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  cartDot: { position: "absolute", right: 9, top: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: theme.primary },
  searchBox: { marginHorizontal: 22, height: 51, paddingLeft: 15, paddingRight: 6, borderRadius: 16, backgroundColor: theme.isDark ? '#1E1E1E' : "#F5ECEF", flexDirection: "row", alignItems: "center", gap: 9 },
  searchInput: { flex: 1, fontSize: 12, color: theme.text, paddingVertical: 8, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}) },
  filterButton: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: theme.primary },
  
  hero: { marginHorizontal: 22, marginTop: 23, minHeight: 247, borderRadius: 26, paddingTop: 22, paddingHorizontal: 20, paddingBottom: 29, backgroundColor: theme.isDark ? '#2C1F23' : "#F4DDE5", overflow: "hidden" },
  heroTextContent: { zIndex: 2, alignItems: "flex-start" },
  heroLabel: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: theme.isDark ? '#442A32' : "#FFFFFFA8", paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20 },
  heroLabelText: { fontSize: 9, fontWeight: "800", color: theme.primary, letterSpacing: 1 },
  heroTitle: { marginTop: 14, fontSize: 27, lineHeight: 34, fontWeight: "900", color: theme.text, letterSpacing: -0.6 },
  heroDescription: { marginTop: 8, fontSize: 11, lineHeight: 17, color: theme.textMuted },
  heroButton: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 15, paddingHorizontal: 15, paddingVertical: 11, backgroundColor: theme.primary, borderRadius: 12 },
  heroButtonText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  heroDecoration: { position: "absolute", right: -4, top: 46, width: 145, height: 150, alignItems: "center", justifyContent: "center" },
  heroCircle: { width: 116, height: 116, borderRadius: 58, backgroundColor: theme.isDark ? '#1A1114' : "#F9EAF0", alignItems: "center", justifyContent: "center", borderWidth: 7, borderColor: theme.isDark ? '#2C1F23' : "#FFFFFF70" },
  heroEmoji: { fontSize: 65 },
  heroSparkle: { position: "absolute", right: 12, top: 0, width: 37, height: 37, borderRadius: 14, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center" },
  
  benefits: { marginTop: 21, marginHorizontal: 22, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: theme.card, borderRadius: 17, paddingVertical: 15, paddingHorizontal: 10, borderWidth: 1, borderColor: theme.border },
  benefitItem: { flex: 1, alignItems: "center", gap: 5 },
  benefitText: { fontSize: 9, color: theme.text, fontWeight: "600", textAlign: "center" },
  benefitDivider: { width: 1, height: 30, backgroundColor: theme.border },
  
  section: { marginTop: 30 },
  sectionHeading: { marginHorizontal: 22, marginBottom: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 19, fontWeight: "900", color: theme.text, letterSpacing: -0.4 },
  sectionSubtitle: { marginTop: 5, fontSize: 11, color: theme.textMuted },
  
  // GAP LÀ 380, KÍCH THƯỚC 65
  categoryList: { paddingHorizontal: 22, gap: 380, paddingBottom: 10 },
  categoryItem: { width: 65, alignItems: "center", flexShrink: 0 }, 
  categoryCircle: { width: 65, height: 65, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  categoryName: { fontSize: 10, fontWeight: "700", color: theme.text, marginTop: 8, textAlign: "center" },
  
  aiCard: { position: "relative", overflow: "hidden", marginHorizontal: 22, marginTop: 31, borderRadius: 24, backgroundColor: theme.isDark ? '#2A2A2A' : "#F5E8DF", padding: 20 },
  aiTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: theme.primary, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9 },
  aiBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  aiTitle: { marginTop: 17, fontSize: 23, lineHeight: 30, fontWeight: "900", color: theme.text, letterSpacing: -0.4 },
  aiDescription: { maxWidth: "90%", marginTop: 8, fontSize: 11, lineHeight: 18, color: theme.textMuted },
  aiButton: { alignSelf: "flex-start", marginTop: 17, backgroundColor: theme.primary, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 9 },
  aiButtonText: { fontSize: 11, fontWeight: "800", color: "#FFFFFF" },
  
  productGrid: { marginHorizontal: 22, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  productCard: { width: "48%", marginBottom: 15, backgroundColor: theme.card, borderRadius: 19, padding: 9, borderWidth: 1, borderColor: theme.border },
  productImage: { height: 140, borderRadius: 14, alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" },
  productPhoto: { width: "100%", height: "100%", position: "absolute" },
  productTag: { position: "absolute", top: 9, left: 8, backgroundColor: theme.isDark ? '#333' : "#FFFFFFD9", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 5, zIndex: 1 },
  productTagText: { fontSize: 7, fontWeight: "900", color: theme.primary },
  productInfo: { paddingHorizontal: 3, paddingTop: 11, paddingBottom: 3 },
  productName: { fontSize: 13, fontWeight: "900", color: theme.text },
  productDetail: { fontSize: 10, color: theme.textMuted, marginTop: 5 },
  priceRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 9 },
  productPrice: { color: theme.primary, fontWeight: "900", fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  filterLabel: { fontSize: 15, fontWeight: '700', color: theme.text, marginTop: 10, marginBottom: 12 },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background },
  filterBtnActive: { borderColor: theme.primary, backgroundColor: theme.isDark ? '#442A32' : '#FCE6EE' },
  filterBtnText: { fontSize: 13, color: theme.textMuted, fontWeight: '600' },
  filterBtnTextActive: { color: theme.primary, fontWeight: '800' },
  starFilterBtn: { minWidth: 60, justifyContent: 'center' },
  clearFilterBtn: { flex: 1, paddingVertical: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  clearFilterText: { color: theme.textMuted, fontSize: 15, fontWeight: '800' },
  applyFilterBtn: { flex: 2, backgroundColor: theme.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  applyFilterText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});