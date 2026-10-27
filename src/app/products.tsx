import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
// @ts-ignore
import { Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, Modal, Platform, ActivityIndicator } from "react-native";
import { useCart } from "../presentation/contexts/CartContext";
import { useTheme } from "../presentation/contexts/ThemeContext";
import { useAuth } from "../presentation/contexts/AuthContext";
import { useWishlist } from "../presentation/contexts/WishlistContext";
import BottomNav from "../presentation/components/BottomNav"; 
import { useProducts } from "../presentation/hooks/useProducts"; 

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80";

export default function ProductsScreen() {
  const router = useRouter();
  const { addToCart, cart } = useCart(); 
  const { theme } = useTheme();
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { products, loading, error } = useProducts();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempSize, setTempSize] = useState('Mặc định');

  const handleToggleWishlist = (e: any, productId: string) => {
    e.stopPropagation(); 
    if (!user) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để lưu sản phẩm yêu thích!");
      return;
    }
    toggleWishlist(productId);
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const keyword = search.trim().toLowerCase();
    return products.filter((product: any) => {
      const matchesSearch = !keyword || `${product.name} ${product.brand}`.toLowerCase().includes(keyword);
      let matchesCategory = true;
      if (selectedCategory !== "Tất cả") {
        if (selectedCategory === "Làm sạch") matchesCategory = product.category === "cleanser";
        else if (selectedCategory === "Serum") matchesCategory = product.category === "serum";
        else if (selectedCategory === "Dưỡng ẩm") matchesCategory = product.category === "moisturizer";
        else if (selectedCategory === "Chống nắng") matchesCategory = product.category === "sunscreen";
      }
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  const handleOpenAddModal = (product: any) => {
    setSelectedProduct(product);
    setTempQuantity(1);
    setTempSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Mặc định');
    setModalVisible(true);
  };

  const handleConfirmAdd = async () => {
    if (!selectedProduct) return;
    await addToCart(selectedProduct, tempQuantity, tempSize);
    setModalVisible(false);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen} edges={["top", "left", "right"]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={dynamicStyles.scrollContent}>
        
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.logo}>Beauty<Text style={dynamicStyles.logoAccent}>Tech.</Text></Text>
          <Pressable style={dynamicStyles.cartButton} onPress={() => router.push('/cart')}>
            <Ionicons name="bag-handle-outline" size={23} color={theme.primary} />
            {totalCartItems > 0 && (<View style={dynamicStyles.cartBadge}><Text style={dynamicStyles.cartBadgeText}>{totalCartItems}</Text></View>)}
          </Pressable>
        </View>

        <View style={dynamicStyles.searchBox}>
          <Ionicons name="search-outline" size={21} color={theme.textMuted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Tìm sản phẩm..." placeholderTextColor={theme.textMuted} style={dynamicStyles.searchInput} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : error ? (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>Lỗi kết nối API: {error}</Text>
        ) : (
          <View style={dynamicStyles.productGrid}>
            {filteredProducts.map((product: any) => {
              // 👇 Lấy biến boolean 1 lần duy nhất cho cả màu và icon
              const isFav = wishlistIds.includes(product._id);
              
              return (
                <Pressable 
                  key={product._id} 
                  style={dynamicStyles.productCard} 
                  onPress={() => router.push({ pathname: "/product-detail", params: { id: product._id } })}
                >
                  <View style={[dynamicStyles.productImageWrap, { backgroundColor: theme.isDark ? '#333' : '#F9F9F9' }]}>
                    <Image source={{ uri: product.image || FALLBACK_IMAGE }} style={dynamicStyles.productImage} resizeMode="cover" />
                    
                    <Pressable 
                      style={dynamicStyles.favoriteBtn} 
                      onPress={(e) => handleToggleWishlist(e, product._id)}
                    >
                      <Ionicons 
                        key={isFav ? "filled" : "outline"}
                        name={isFav ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isFav ? "#E91E63" : "#555"} 
                      />
                    </Pressable>
                  </View>
                  
                  <Text style={dynamicStyles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={dynamicStyles.productBrand} numberOfLines={1}>{product.brand}</Text>
                  
                  <View style={dynamicStyles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FFC107" />
                    <Text style={dynamicStyles.ratingText}>{product.rating}</Text>
                    <Text style={dynamicStyles.soldText}>({product.sold})</Text>
                  </View>

                  <Text style={dynamicStyles.productPrice}>{product.price.toLocaleString('vi-VN')}đ</Text>
                  
                  <Pressable style={dynamicStyles.addButton} onPress={() => handleOpenAddModal(product)}>
                    <Ionicons name="add" size={20} color="#FFFFFF" /><Text style={dynamicStyles.addButtonText}>Thêm vào giỏ</Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BottomNav />

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
                <Text style={dynamicStyles.modalLabel}>Phân loại (Dung tích):</Text>
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
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 110 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { fontSize: 25, fontWeight: "900", color: theme.text },
  logoAccent: { color: theme.primary },
  cartButton: { width: 45, height: 45, borderRadius: 16, backgroundColor: theme.isDark ? '#2A2A2A' : "#F9E9EE", justifyContent: "center", alignItems: "center" },
  cartBadge: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: theme.primary, justifyContent: "center", alignItems: "center" },
  cartBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  searchBox: { height: 49, borderRadius: 16, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10, marginBottom: 20 },
  searchInput: { flex: 1, color: theme.text, fontSize: 13, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}) },
  productGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 15 },
  productCard: { width: "48%", backgroundColor: theme.card, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 10 },
  productImageWrap: { height: 150, borderRadius: 13, overflow: "hidden", position: 'relative' },
  productImage: { width: "100%", height: "100%" },
  
  favoriteBtn: { 
    position: 'absolute', top: 8, right: 8, 
    width: 32, height: 32, 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
    zIndex: 10 
  },

  productName: { fontSize: 14, fontWeight: "800", color: theme.text, marginTop: 10 },
  productBrand: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  ratingText: { fontSize: 12, color: theme.text, fontWeight: "700" },
  soldText: { fontSize: 10, color: theme.textMuted },
  productPrice: { fontSize: 14, fontWeight: "800", color: theme.primary, marginTop: 5, marginBottom: 10 },
  addButton: { height: 34, backgroundColor: theme.primary, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  addButtonText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { width: '90%', maxWidth: 400, backgroundColor: theme.card, borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
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