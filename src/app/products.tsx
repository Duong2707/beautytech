import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View, Modal } from "react-native";
import { useCart } from "../presentation/contexts/CartContext";

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
];

function productCategory(name: string) {
  if (name.includes("Serum")) return "Serum";
  if (name.includes("Cream")) return "Dưỡng ẩm";
  if (name.includes("Cleanser") || name.includes("Toner")) return "Làm sạch";
  return "";
}

export default function ProductsScreen() {
  const router = useRouter();
  const { addToCart, cart } = useCart(); 
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // State cho Modal
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

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFAF8" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Beauty<Text style={styles.logoAccent}>Tech.</Text></Text>
          </View>
          <Pressable style={styles.cartButton} onPress={() => router.push('/cart')}>
            <Ionicons name="bag-handle-outline" size={23} color="#BC6280" />
            {totalCartItems > 0 && (<View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalCartItems}</Text></View>)}
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={21} color="#B58A99" />
          <TextInput value={search} onChangeText={setSearch} placeholder="Tìm sản phẩm..." placeholderTextColor="#B9A5AC" style={styles.searchInput} />
        </View>

        <View style={styles.productGrid}>
          {filteredProducts.map((product) => (
            <View key={product.name} style={styles.productCard}>
              <View style={[styles.productImageWrap, { backgroundColor: product.color }]}>
                <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
              </View>
              <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
              
              <Pressable style={styles.addButton} onPress={() => handleOpenAddModal(product)}>
                <Ionicons name="add" size={20} color="#FFFFFF" /><Text style={styles.addButtonText}>Thêm vào giỏ</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL CHỌN SIZE & SỐ LƯỢNG */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phân loại hàng</Text>
              <Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color="#49313C" /></Pressable>
            </View>

            {selectedProduct && (
              <>
                <View style={styles.modalProductInfo}>
                  <Image source={{ uri: selectedProduct.image }} style={styles.modalImage} />
                  <View style={styles.modalTextInfo}>
                    <Text style={styles.modalPrice}>{selectedProduct.price}</Text>
                    <Text style={styles.modalStock}>Kho: 120</Text>
                  </View>
                </View>

                <Text style={styles.modalLabel}>Phân loại (Dung tích):</Text>
                <View style={styles.modalSizeRow}>
                  {selectedProduct.sizes?.map((size: string) => (
                    <Pressable key={size} style={[styles.modalSizeBtn, tempSize === size && styles.modalSizeBtnActive]} onPress={() => setTempSize(size)}>
                      <Text style={[styles.modalSizeText, tempSize === size && styles.modalSizeTextActive]}>{size}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.modalQtyRow}>
                  <Text style={styles.modalLabel}>Số lượng:</Text>
                  <View style={styles.modalQtyControl}>
                    <Pressable style={styles.modalQtyBtn} onPress={() => setTempQuantity(Math.max(1, tempQuantity - 1))}><Ionicons name="remove" size={18} color="#49313C" /></Pressable>
                    <Text style={styles.modalQtyText}>{tempQuantity}</Text>
                    <Pressable style={styles.modalQtyBtn} onPress={() => setTempQuantity(tempQuantity + 1)}><Ionicons name="add" size={18} color="#49313C" /></Pressable>
                  </View>
                </View>

                <Pressable style={styles.modalConfirmBtn} onPress={handleConfirmAdd}>
                  <Text style={styles.modalConfirmText}>Thêm vào giỏ hàng</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFAF8" },
  scrollContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 110 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { fontSize: 25, fontWeight: "900", color: "#49313C" },
  logoAccent: { color: "#C15E80" },
  cartButton: { width: 45, height: 45, borderRadius: 16, backgroundColor: "#F9E9EE", justifyContent: "center", alignItems: "center" },
  cartBadge: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: "#D85D85", justifyContent: "center", alignItems: "center" },
  cartBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  searchBox: { height: 49, borderRadius: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#F1E0E6", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10, marginBottom: 20 },
  searchInput: { flex: 1, color: "#49323B", fontSize: 13 },
  productGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 15 },
  productCard: { width: "48%", backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "#F4E8EC", padding: 10 },
  productImageWrap: { height: 150, borderRadius: 13, overflow: "hidden" },
  productImage: { width: "100%", height: "100%" },
  productName: { fontSize: 14, fontWeight: "800", color: "#49323B", marginTop: 10 },
  productPrice: { fontSize: 14, fontWeight: "800", color: "#C45F83", marginTop: 5, marginBottom: 10 },
  addButton: { height: 34, backgroundColor: "#C87391", borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  addButtonText: { fontSize: 11, fontWeight: "700", color: "#FFFFFF" },
  
  // CSS Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { width: '90%', maxWidth: 400, backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#49313C' },
  modalProductInfo: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  modalImage: { width: 80, height: 80, borderRadius: 10 },
  modalTextInfo: { justifyContent: 'center' },
  modalPrice: { fontSize: 18, fontWeight: '900', color: '#BC6280' },
  modalStock: { fontSize: 12, color: '#8A6C78', marginTop: 5 },
  modalLabel: { fontSize: 14, fontWeight: '700', color: '#49313C', marginBottom: 10 },
  modalSizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  modalSizeBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#F0DDE4', backgroundColor: '#FFF' },
  modalSizeBtnActive: { borderColor: '#BC6280', backgroundColor: '#FCE6EE' },
  modalSizeText: { fontSize: 13, color: '#6E535E' },
  modalSizeTextActive: { color: '#BC6280', fontWeight: '800' },
  modalQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalQtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 10, borderWidth: 1, borderColor: '#EEE' },
  modalQtyBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  modalQtyText: { fontSize: 15, fontWeight: '700', color: '#49313C', width: 35, textAlign: 'center' },
  modalConfirmBtn: { backgroundColor: '#BC6280', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});