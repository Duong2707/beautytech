import { useMemo, useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, Platform, Modal, ActivityIndicator } from "react-native";
import { useCart } from "../presentation/contexts/CartContext";
import { useTheme } from "../presentation/contexts/ThemeContext";
import BottomNav from "../presentation/components/BottomNav"; 
import { useProducts } from "../presentation/hooks/useProducts"; 

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

const brands = ["Tất cả", "BeautyTech", "Cerave", "Cetaphil", "La Roche-Posay", "Klairs", "The Ordinary", "Obagi", "Innisfree", "Simple", "Bioderma", "Hada Labo", "L'Oreal"];

function getCategoryQuery(vnName: string) {
  if (vnName === "Làm sạch") return "cleanser";
  if (vnName === "Serum") return "serum";
  if (vnName === "Dưỡng ẩm") return "moisturizer";
  if (vnName === "Chống nắng") return "sunscreen";
  if (vnName === "Trị mụn") return "treatment";
  return "";
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80";

export default function HomeScreen() {
  const router = useRouter();
  const { cart, addToCart } = useCart(); 
  const { theme } = useTheme(); 
  const { products, loading, error } = useProducts();
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'under200' | '200to300' | 'above300'>('all');
  const [brandFilter, setBrandFilter] = useState<string>('Tất cả');
  const [ratingFilter, setRatingFilter] = useState<number>(0); 

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempSize, setTempSize] = useState('Mặc định');

  const categoryScrollRef = useRef<ScrollView>(null);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const keyword = search.trim().toLowerCase();
    return products.filter((product: any) => {
      const matchesSearch = !keyword || `${product.name} ${product.description}`.toLowerCase().includes(keyword);
      
      let matchesCategory = true;
      if (selectedCategory) {
        matchesCategory = product.category === getCategoryQuery(selectedCategory);
      }
      
      let matchesPrice = true;
      if (priceFilter === 'under200') matchesPrice = product.price < 200000;
      else if (priceFilter === '200to300') matchesPrice = product.price >= 200000 && product.price <= 300000;
      else if (priceFilter === 'above300') matchesPrice = product.price > 300000;

      const matchesBrand = brandFilter === 'Tất cả' || product.brand === brandFilter;
      const matchesRating = product.rating >= ratingFilter;

      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesRating;
    });
  }, [products, search, selectedCategory, priceFilter, brandFilter, ratingFilter]);

  const resetFilters = () => {
    setPriceFilter('all');
    setBrandFilter('Tất cả');
    setRatingFilter(0);
    setSelectedCategory("");
  };

  const handleOpenAddModal = (product: any) => {
    setSelectedProduct(product);
    setTempQuantity(1);
    setTempSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Mặc định');
    setModalVisible(true);
  };

  const handleConfirmAdd = () => {
    if (!selectedProduct) return;
    addToCart({ 
      id: selectedProduct._id, 
      name: selectedProduct.name, 
      price: `${selectedProduct.price.toLocaleString('vi-VN')}đ`, 
      priceValue: selectedProduct.price, 
      image: selectedProduct.image || FALLBACK_IMAGE
    }, tempQuantity, tempSize);
    setModalVisible(false);
    Alert.alert("Thành công", `Đã thêm ${tempQuantity} ${selectedProduct.name} vào giỏ.`);
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
          <TextInput placeholder="Tìm sản phẩm..." placeholderTextColor={theme.textMuted} value={search} onChangeText={setSearch} style={dynamicStyles.searchInput} />
          <Pressable onPress={() => setIsFilterModalVisible(true)} style={dynamicStyles.filterButton}>
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
            <Pressable onPress={() => categoryScrollRef.current?.scrollToEnd({ animated: true })}>
              <Ionicons name="arrow-forward-circle-outline" size={27} color={theme.primary} />
            </Pressable>
          </View>
          <ScrollView ref={categoryScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={dynamicStyles.categoryList}>
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
          
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
          ) : error ? (
            <Text style={{ textAlign: 'center', color: 'red', marginTop: 20 }}>Lỗi tải dữ liệu: {error}</Text>
          ) : filteredProducts.length === 0 ? (
            <Text style={{ textAlign: 'center', color: theme.textMuted, marginTop: 20 }}>Không tìm thấy sản phẩm nào.</Text>
          ) : (
            <View style={dynamicStyles.productGrid}>
              {filteredProducts.map((product: any) => (
                <Pressable key={product._id} style={dynamicStyles.productCard} onPress={() => router.push({ pathname: "/product-detail", params: { id: product._id, name: product.name, detail: product.description, price: product.price, image: product.image || FALLBACK_IMAGE, tag: product.category } })}>
                  <View style={[dynamicStyles.productImage, { backgroundColor: theme.isDark ? '#333' : '#F9F9F9' }]}>
                    <Image source={{ uri: product.image || FALLBACK_IMAGE }} style={dynamicStyles.productPhoto} resizeMode="cover" />
                    <View style={dynamicStyles.productTag}><Text style={dynamicStyles.productTagText}>{product.brand}</Text></View>
                  </View>
                  <View style={dynamicStyles.productInfo}>
                    <Text style={dynamicStyles.productName} numberOfLines={1}>{product.name}</Text>
                    <View style={dynamicStyles.ratingRow}>
                      <Ionicons name="star" size={12} color="#FFC107" />
                      <Text style={dynamicStyles.ratingText}>{product.rating}</Text>
                      <Text style={dynamicStyles.soldText}>({product.sold})</Text>
                    </View>
                    <View style={dynamicStyles.priceRow}><Text style={dynamicStyles.productPrice}>{product.price.toLocaleString('vi-VN')}đ</Text></View>
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
              <Pressable onPress={() => setIsFilterModalVisible(false)}><Ionicons name="close" size={24} color={theme.text} /></Pressable>
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

      {/* MODAL THÊM VÀO GIỎ (TỪ TRANG CHỦ) */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Chọn phân loại hàng</Text>
              <Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={theme.text} /></Pressable>
            </View>
            {selectedProduct && (
              <>
                <View style={dynamicStyles.modalProductInfo}>
                  <Image source={{ uri: selectedProduct.image || FALLBACK_IMAGE }} style={dynamicStyles.modalImage} />
                  <View style={dynamicStyles.modalTextInfo}>
                    <Text style={dynamicStyles.modalPrice}>{selectedProduct.price.toLocaleString('vi-VN')}đ</Text>
                  </View>
                </View>
                <Text style={dynamicStyles.modalLabel}>Phân loại:</Text>
                <View style={dynamicStyles.modalSizeRow}>
                  {selectedProduct.sizes?.map((size: string) => (
                    <Pressable key={size} style={[dynamicStyles.modalSizeBtn, tempSize === size && dynamicStyles.modalSizeBtnActive]} onPress={() => setTempSize(size)}>
                      <Text style={[dynamicStyles.modalSizeText, tempSize === size && dynamicStyles.modalSizeTextActive]}>{size}</Text>
                    </Pressable>
                  ))}
                </View>
                <View style={dynamicStyles.modalQtyRow}>
                  <Text style={dynamicStyles.modalLabel}>Số lượng:</Text>
                  <View style={dynamicStyles.modalQtyControl}>
                    <Pressable style={dynamicStyles.modalQtyBtn} onPress={() => setTempQuantity(Math.max(1, tempQuantity - 1))}><Ionicons name="remove" size={18} color={theme.text} /></Pressable>
                    <Text style={dynamicStyles.modalQtyText}>{tempQuantity}</Text>
                    <Pressable style={dynamicStyles.modalQtyBtn} onPress={() => setTempQuantity(tempQuantity + 1)}><Ionicons name="add" size={18} color={theme.text} /></Pressable>
                  </View>
                </View>
                <Pressable style={dynamicStyles.modalConfirmBtn} onPress={handleConfirmAdd}>
                  <Text style={dynamicStyles.modalConfirmText}>Thêm vào giỏ hàng</Text>
                </Pressable>
              </>
            )}
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
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  ratingText: { fontSize: 12, color: theme.text, fontWeight: "700" },
  soldText: { fontSize: 10, color: theme.textMuted },
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

  modalProductInfo: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  modalImage: { width: 80, height: 80, borderRadius: 10 },
  modalTextInfo: { justifyContent: 'center' },
  modalPrice: { fontSize: 18, fontWeight: '900', color: theme.primary },
  modalLabel: { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 10 },
  modalSizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  modalSizeBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.background },
  modalSizeBtnActive: { borderColor: theme.primary, backgroundColor: theme.isDark ? '#442A32' : '#FCE6EE' },
  modalSizeText: { fontSize: 13, color: theme.textMuted },
  modalSizeTextActive: { color: theme.primary, fontWeight: '800' },
  modalQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalQtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, borderRadius: 10, borderWidth: 1, borderColor: theme.border },
  modalQtyBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  modalQtyText: { fontSize: 15, fontWeight: '700', color: theme.text, width: 35, textAlign: 'center' },
  modalConfirmBtn: { backgroundColor: theme.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});