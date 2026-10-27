import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, Modal, Platform } from "react-native";
import { useCart } from "../presentation/contexts/CartContext";
import { useTheme } from "../presentation/contexts/ThemeContext";
import BottomNav from "../presentation/components/BottomNav"; // Import BottomNav

const categories = [
  { name: "Tất cả", icon: "grid-outline" as const },
  { name: "Làm sạch", icon: "water-outline" as const },
  { name: "Serum", icon: "flask-outline" as const },
  { name: "Dưỡng ẩm", icon: "flower-outline" as const },
  { name: "Chống nắng", icon: "sunny-outline" as const },
];

const products = [
  { name: "Glow Serum", detail: "Serum dưỡng sáng da", price: "259.000đ", oldPrice: "320.000đ", image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80", color: "#F8E4E9", tag: "BÁN CHẠY", sizes: ['15ml', '30ml', '50ml'] },
  { name: "Hydra Cream", detail: "Kem dưỡng ẩm sâu", price: "320.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80", color: "#F5EBDD", tag: "YÊU THÍCH", sizes: ['30ml', '50ml', '80ml'] },
  { name: "Pure Cleanser", detail: "Sữa rửa mặt dịu nhẹ", price: "189.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&auto=format&fit=crop&q=80", color: "#E8EDE4", tag: "MỚI", sizes: ['100ml', '150ml'] },
  { name: "Daily Sunscreen", detail: "Kem chống nắng SPF 50+", price: "285.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80", color: "#F8EAD7", tag: "NỔI BẬT", sizes: ['30ml', '50ml'] },
  { name: "Rose Toner", detail: "Nước cân bằng da dịu nhẹ", price: "199.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&auto=format&fit=crop&q=80", color: "#F8E4E9", tag: "BÁN CHẠY", sizes: ['100ml', '200ml'] },
  { name: "Vitamin C Serum", detail: "Serum vitamin C chăm sóc da", price: "349.000đ", oldPrice: "", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80", color: "#F5EBDD", tag: "NỔI BẬT", sizes: ['15ml', '30ml'] },
];

function productCategory(name: string) {
  if (name.includes("Serum")) return "Serum";
  if (name.includes("Cream") || name.includes("Lotion")) return "Dưỡng ẩm";
  if (name.includes("Cleanser") || name.includes("Cleansing") || name.includes("Toner")) return "Làm sạch";
  if (name.includes("Sunscreen")) return "Chống nắng";
  return "";
}

export default function ProductsScreen() {
  const router = useRouter();
  const { addToCart, cart } = useCart(); 
  const { theme } = useTheme();
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempSize, setTempSize] = useState('');

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !keyword || `${product.name} ${product.detail}`.toLowerCase().includes(keyword);
      const matchesCategory = selectedCategory === "Tất cả" || productCategory(product.name) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const handleOpenAddModal = (product: any) => {
    setSelectedProduct(product);
    setTempQuantity(1);
    setTempSize(product.sizes ? product.sizes[0] : 'Mặc định');
    setModalVisible(true);
  };

  const handleConfirmAdd = () => {
    if (!selectedProduct) return;
    const priceValue = parseInt(selectedProduct.price.replace(/\D/g, '')); 
    addToCart({ id: selectedProduct.name, name: selectedProduct.name, price: selectedProduct.price, priceValue: priceValue, image: selectedProduct.image }, tempQuantity, tempSize);
    setModalVisible(false);
    Alert.alert("Thành công", `Đã thêm ${tempQuantity} ${selectedProduct.name} (${tempSize}) vào giỏ.`);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen} edges={["top", "left", "right"]}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={dynamicStyles.scrollContent}>
        
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.logo}>Beauty<Text style={dynamicStyles.logoAccent}>Tech.</Text></Text>
            <Text style={dynamicStyles.subtitle}>YOUR PERSONAL BEAUTY SPACE</Text>
          </View>
          <Pressable style={dynamicStyles.cartButton} onPress={() => router.push('/cart')}>
            <Ionicons name="bag-handle-outline" size={23} color={theme.primary} />
            {totalCartItems > 0 && (<View style={dynamicStyles.cartBadge}><Text style={dynamicStyles.cartBadgeText}>{totalCartItems}</Text></View>)}
          </Pressable>
        </View>

        <View style={dynamicStyles.searchBox}>
          <Ionicons name="search-outline" size={21} color={theme.textMuted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Tìm sản phẩm..." placeholderTextColor={theme.textMuted} style={dynamicStyles.searchInput} />
        </View>

        <View style={dynamicStyles.productGrid}>
          {filteredProducts.map((product) => (
            <View key={product.name} style={dynamicStyles.productCard}>
              <View style={[dynamicStyles.productImageWrap, { backgroundColor: theme.isDark ? '#333' : product.color }]}>
                <Image source={{ uri: product.image }} style={dynamicStyles.productImage} resizeMode="cover" />
              </View>
              <Text style={dynamicStyles.productName} numberOfLines={1}>{product.name}</Text>
              <Text style={dynamicStyles.productPrice}>{product.price}</Text>
              <Pressable style={dynamicStyles.addButton} onPress={() => handleOpenAddModal(product)}>
                <Ionicons name="add" size={20} color="#FFFFFF" /><Text style={dynamicStyles.addButtonText}>Thêm vào giỏ</Text>
              </Pressable>
            </View>
          ))}
        </View>
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
                  <Image source={{ uri: selectedProduct.image }} style={dynamicStyles.modalImage} />
                  <View style={dynamicStyles.modalTextInfo}>
                    <Text style={dynamicStyles.modalPrice}>{selectedProduct.price}</Text>
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
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 110 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { fontSize: 25, fontWeight: "900", color: theme.text },
  logoAccent: { color: theme.primary },
  subtitle: { fontSize: 8, letterSpacing: 1.5, color: theme.textMuted, marginTop: 3 },
  cartButton: { width: 45, height: 45, borderRadius: 16, backgroundColor: theme.isDark ? '#2A2A2A' : "#F9E9EE", justifyContent: "center", alignItems: "center" },
  cartBadge: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: theme.primary, justifyContent: "center", alignItems: "center" },
  cartBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  searchBox: { height: 49, borderRadius: 16, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10, marginBottom: 20 },
  
  // Đã thêm outlineStyle: 'none' để xóa viền đen trên Web
  searchInput: { 
    flex: 1, 
    color: theme.text, 
    fontSize: 13,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}) 
  },
  
  productGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 15 },
  productCard: { width: "48%", backgroundColor: theme.card, borderRadius: 18, borderWidth: 1, borderColor: theme.border, padding: 10 },
  productImageWrap: { height: 150, borderRadius: 13, overflow: "hidden" },
  productImage: { width: "100%", height: "100%" },
  productName: { fontSize: 14, fontWeight: "800", color: theme.text, marginTop: 10 },
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