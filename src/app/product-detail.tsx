import React, { useState, useEffect } from 'react';
// @ts-ignore
import { View, Text, ScrollView, Image, Pressable, StyleSheet, StatusBar, Alert, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../presentation/contexts/CartContext'; 
import { useTheme } from '../presentation/contexts/ThemeContext';
import { useAuth } from '../presentation/contexts/AuthContext';
import { useWishlist } from '../presentation/contexts/WishlistContext';
import { ProductRepositoryImpl } from '../data/repositories/ProductRepositoryImpl';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { addToCart, cart } = useCart(); 
  const { theme } = useTheme();
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  
  const params = useLocalSearchParams<{ id?: string }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempSize, setTempSize] = useState('Mặc định');

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('Không tìm thấy ID sản phẩm');
        setLoading(false);
        return;
      }
      try {
        const repo = new ProductRepositoryImpl();
        const data = await repo.getById(productId);
        if (data) {
          setProduct(data);
          if (data.sizes && data.sizes.length > 0) setTempSize(data.sizes[0]);
        } else {
          setError('Sản phẩm không tồn tại.');
        }
      } catch (err: any) {
        setError('Lỗi khi tải chi tiết sản phẩm.');
      } finally {
        setLoading(false); 
      }
    };
    fetchProduct();
  }, [productId]);

  const handleToggleWishlist = () => {
    if (!product?._id) return;
    if (!user) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để lưu sản phẩm!");
      return;
    }
    toggleWishlist(product._id);
  };

  const handleOpenModal = () => {
    setTempQuantity(1);
    if (product?.sizes && product.sizes.length > 0) setTempSize(product.sizes[0]);
    else setTempSize('Mặc định');
    setModalVisible(true);
  };

  const handleConfirmAdd = async () => {
    if (!product) return;
    await addToCart(product, tempQuantity, tempSize);
    setModalVisible(false);
  };

  const dynamicStyles = getStyles(theme);

  if (loading) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={60} color={theme.textMuted} />
        <Text style={{ color: theme.text, fontSize: 16, marginTop: 10, textAlign: 'center' }}>{error || 'Không tìm thấy sản phẩm'}</Text>
        <Pressable style={{ marginTop: 20, padding: 10, backgroundColor: theme.primary, borderRadius: 10 }} onPress={() => router.back()}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.screen}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={dynamicStyles.scrollContent}>
        
        <View style={dynamicStyles.header}>
          <Pressable style={dynamicStyles.iconButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/home")}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={dynamicStyles.headerTitle}>Chi tiết sản phẩm</Text>
          
          <Pressable style={dynamicStyles.headerFavoriteBtn} onPress={handleToggleWishlist}>
            <Ionicons 
              key={wishlistIds.includes(product._id) ? "filled" : "outline"}
              name={wishlistIds.includes(product._id) ? 'heart' : 'heart-outline'} 
              size={22} 
              color={wishlistIds.includes(product._id) ? "#E91E63" : theme.text} 
            />
          </Pressable>
        </View>

        <View style={dynamicStyles.imageContainer}>
          <Image source={{ uri: product.image || FALLBACK_IMAGE }} style={dynamicStyles.productImage} resizeMode="cover" />
          <View style={dynamicStyles.productTag}>
            <Ionicons name="sparkles" size={12} color={theme.primary} />
            <Text style={dynamicStyles.productTagText}>{product.brand}</Text>
          </View>
          
          <Pressable style={dynamicStyles.imageFavoriteBtn} onPress={handleToggleWishlist}>
            <Ionicons 
              key={wishlistIds.includes(product._id) ? "filled" : "outline"}
              name={wishlistIds.includes(product._id) ? 'heart' : 'heart-outline'} 
              size={23} 
              color={wishlistIds.includes(product._id) ? "#E91E63" : "#555"} 
            />
          </Pressable>
        </View>

        <View style={dynamicStyles.content}>
          <View style={dynamicStyles.eyebrowRow}>
            <Text style={dynamicStyles.eyebrow}>{product.brand.toUpperCase()}</Text>
            <View style={dynamicStyles.rating}>
              <Ionicons name="star" size={14} color="#FFC107" />
              <Text style={dynamicStyles.ratingText}>{product.rating}</Text>
              <Text style={dynamicStyles.soldText}>({product.sold} đã bán)</Text>
            </View>
          </View>

          <Text style={dynamicStyles.productName}>{product.name}</Text>
          <View style={dynamicStyles.priceContainer}>
            <Text style={dynamicStyles.price}>{product.price.toLocaleString('vi-VN')}đ</Text>
            {product.originalPrice > 0 && (
              <Text style={dynamicStyles.oldPrice}>{product.originalPrice.toLocaleString('vi-VN')}đ</Text>
            )}
            <View style={dynamicStyles.priceBadge}><Text style={dynamicStyles.priceBadgeText}>Chính hãng</Text></View>
          </View>
          
          <View style={dynamicStyles.divider} />

          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={dynamicStyles.description}>{product.description}</Text>
          </View>

          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.sectionHeader}>
              <Text style={dynamicStyles.sectionTitle}>Phân loại (Dung tích)</Text>
              <Text style={dynamicStyles.selectedSizeText}>{product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Mặc định'}</Text>
            </View>
            <View style={dynamicStyles.sizeRow}>
              {product.sizes?.map((size: string) => (
                <View key={size} style={dynamicStyles.sizeButton}>
                  <Text style={dynamicStyles.sizeText}>{size}</Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable style={dynamicStyles.aiCard} onPress={() => router.push("/chat")}>
            <View style={dynamicStyles.aiIcon}><Ionicons name="sparkles" size={22} color="#FFFFFF" /></View>
            <View style={dynamicStyles.aiTextContainer}>
              <Text style={dynamicStyles.aiTitle}>Chưa biết có hợp với da?</Text>
              <Text style={dynamicStyles.aiDescription}>Hỏi chuyên gia AI BeautyTech ngay để được tư vấn.</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={theme.primary} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={dynamicStyles.bottomBar}>
        <Pressable style={dynamicStyles.bottomIconButton} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={22} color={theme.primary} />
          <Text style={dynamicStyles.bottomIconText}>Giỏ hàng</Text>
          {totalCartItems > 0 && (
            <View style={dynamicStyles.cartBadge}>
              <Text style={dynamicStyles.cartBadgeText}>{totalCartItems > 99 ? "99+" : totalCartItems}</Text>
            </View>
          )}
        </Pressable>
        
        <Pressable style={dynamicStyles.addCartButton} onPress={handleOpenModal}>
          <Ionicons name="bag-add-outline" size={20} color="#FFFFFF" />
          <Text style={dynamicStyles.addCartText}>Thêm vào giỏ</Text>
        </Pressable>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Chọn loại hàng</Text>
              <Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color={theme.text} /></Pressable>
            </View>
            
            {product && (
              <>
                <View style={dynamicStyles.modalProductInfo}>
                  <Image source={{ uri: product.image || FALLBACK_IMAGE }} style={dynamicStyles.modalImage} />
                  <View style={dynamicStyles.modalTextInfo}>
                    <Text style={dynamicStyles.modalPrice}>{product.price.toLocaleString('vi-VN')}đ</Text>
                  </View>
                </View>
                
                <Text style={dynamicStyles.modalLabel}>Phân loại (Dung Tích):</Text>
                <View style={dynamicStyles.modalSizeRow}>
                  {product.sizes?.map((size: string) => (
                    <Pressable 
                      key={size} 
                      style={[dynamicStyles.modalSizeBtn, tempSize === size && dynamicStyles.modalSizeBtnActive]} 
                      onPress={() => setTempSize(size)}
                    >
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
  scrollContent: { paddingBottom: 100 },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
  headerFavoriteBtn: { width: 42, height: 42, borderRadius: 15, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  imageContainer: { marginHorizontal: 20, height: 330, borderRadius: 25, overflow: 'hidden', backgroundColor: theme.isDark ? '#333' : '#F5E6EA', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  productTag: { position: 'absolute', top: 15, left: 15, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.card },
  productTagText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5, color: theme.primary },
  imageFavoriteBtn: { 
    position: 'absolute', top: 13, right: 13, 
    width: 43, height: 43, borderRadius: 15, 
    alignItems: 'center', justifyContent: 'center', 
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3
  },
  content: { paddingHorizontal: 22, paddingTop: 22 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: theme.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, color: theme.text, fontWeight: '800' },
  soldText: { fontSize: 11, color: theme.textMuted, marginLeft: 4 },
  productName: { marginTop: 12, fontSize: 24, lineHeight: 32, fontWeight: '900', color: theme.text, letterSpacing: -0.5 },
  priceContainer: { marginTop: 17, flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { fontSize: 23, fontWeight: '900', color: theme.primary },
  oldPrice: { fontSize: 14, color: theme.textMuted, textDecorationLine: 'line-through' },
  priceBadge: { backgroundColor: theme.isDark ? '#442A32' : '#F8E4E9', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  priceBadgeText: { fontSize: 10, fontWeight: '800', color: theme.primary },
  divider: { height: 1, backgroundColor: theme.border, marginTop: 23 },
  section: { marginTop: 23 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: theme.text },
  description: { marginTop: 10, fontSize: 13, lineHeight: 22, color: theme.textMuted },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedSizeText: { fontSize: 12, fontWeight: '700', color: theme.primary },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 13 },
  sizeButton: { minWidth: 76, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  sizeText: { fontSize: 13, fontWeight: '700', color: theme.textMuted },
  aiCard: { marginTop: 22, padding: 15, borderRadius: 18, backgroundColor: theme.isDark ? '#2A2A2A' : '#F5E8DF', flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  aiTextContainer: { flex: 1 },
  aiTitle: { fontSize: 12, fontWeight: '900', color: theme.text },
  aiDescription: { marginTop: 5, fontSize: 10, lineHeight: 16, color: theme.textMuted },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border, position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomIconButton: { width: 75, alignItems: 'center', justifyContent: 'center', gap: 4 },
  bottomIconText: { fontSize: 9, fontWeight: '700', color: theme.primary },
  cartBadge: { position: 'absolute', top: -4, right: 15, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  addCartButton: { flex: 1, minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: theme.primary, borderRadius: 15 },
  addCartText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
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