import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, StyleSheet, StatusBar, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../presentation/contexts/CartContext'; 
import { useTheme } from '../presentation/contexts/ThemeContext'; // Import Theme

const defaultProducts = [
  {
    name: 'Glow Serum', detail: 'Serum dưỡng sáng da', price: '259.000đ', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80', tag: 'BÁN CHẠY', description: 'Serum chăm sóc da hằng ngày, giúp làn da trông tươi tắn và rạng rỡ hơn. Phù hợp để bổ sung vào quy trình chăm sóc da cá nhân.', sizes: ['15ml', '30ml', '50ml'],
  },
  {
    name: 'Hydra Cream', detail: 'Kem dưỡng ẩm sâu', price: '320.000đ', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop&q=80', tag: 'YÊU THÍCH', description: 'Kem dưỡng ẩm cho quy trình chăm sóc da hằng ngày. Sử dụng sau bước làm sạch và các sản phẩm dưỡng da phù hợp.', sizes: ['30ml', '50ml', '80ml'],
  },
];

export default function ProductDetailScreen() {
  const router = useRouter();
  const { addToCart } = useCart(); 
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ name?: string; detail?: string; price?: string; image?: string; tag?: string; }>();
  
  const paramName = Array.isArray(params.name) ? params.name[0] : params.name;
  const product = defaultProducts.find((item) => item.name === paramName) ?? defaultProducts[0];

  const name = paramName || product.name;
  const detail = params.detail || product.detail;
  const price = params.price || product.price;
  const image = (Array.isArray(params.image) ? params.image[0] : params.image) || product.image;
  const tag = (Array.isArray(params.tag) ? params.tag[0] : params.tag) || product.tag;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] || product.sizes[0] || 'Mặc định');
  const [favorite, setFavorite] = useState(false);

  const handleAddToCart = () => {
    const priceValue = parseInt(price.replace(/\D/g, '')); 
    addToCart({ id: name, name: name, price: price, priceValue: priceValue, image: image }, quantity, selectedSize);

    Alert.alert(
      'Đã thêm vào giỏ hàng',
      `${name}\nDung tích: ${selectedSize}\nSố lượng: ${quantity}\nGiá tham khảo: ${price}`,
      [
        { text: 'Tiếp tục mua sắm', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => router.push('/cart') },
      ],
    );
  };

  const dynamicStyles = getStyles(theme);

  return (
    <View style={dynamicStyles.screen}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={dynamicStyles.scrollContent}>
        
        <View style={dynamicStyles.header}>
          <Pressable style={dynamicStyles.iconButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/home")}>
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <Text style={dynamicStyles.headerTitle}>Chi tiết sản phẩm</Text>
          <Pressable style={dynamicStyles.iconButton} onPress={() => setFavorite((value) => !value)}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? theme.primary : theme.text} />
          </Pressable>
        </View>

        <View style={dynamicStyles.imageContainer}>
          <Image source={{ uri: image }} style={dynamicStyles.productImage} resizeMode="cover" />
          <View style={dynamicStyles.productTag}><Ionicons name="sparkles" size={12} color={theme.primary} /><Text style={dynamicStyles.productTagText}>{tag}</Text></View>
          <Pressable style={dynamicStyles.imageFavorite} onPress={() => setFavorite((value) => !value)}><Ionicons name={favorite ? 'heart' : 'heart-outline'} size={23} color={favorite ? theme.primary : theme.text} /></Pressable>
        </View>

        <View style={dynamicStyles.content}>
          <View style={dynamicStyles.eyebrowRow}>
            <Text style={dynamicStyles.eyebrow}>BEAUTYTECH COLLECTION</Text>
            <View style={dynamicStyles.rating}><Ionicons name="star" size={14} color="#D9A24A" /><Text style={dynamicStyles.ratingText}>4.9</Text></View>
          </View>
          <Text style={dynamicStyles.productName}>{name}</Text>
          <Text style={dynamicStyles.productSubtitle}>{detail}</Text>
          <View style={dynamicStyles.priceContainer}><Text style={dynamicStyles.price}>{price}</Text><View style={dynamicStyles.priceBadge}><Text style={dynamicStyles.priceBadgeText}>Ưu đãi</Text></View></View>
          <View style={dynamicStyles.divider} />

          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={dynamicStyles.description}>{product.description}</Text>
          </View>

          <View style={dynamicStyles.section}>
            <View style={dynamicStyles.sectionHeader}><Text style={dynamicStyles.sectionTitle}>Dung tích / Phân loại</Text><Text style={dynamicStyles.selectedSizeText}>{selectedSize}</Text></View>
            <View style={dynamicStyles.sizeRow}>
              {product.sizes.map((size) => (
                <Pressable key={size} onPress={() => setSelectedSize(size)} style={[dynamicStyles.sizeButton, selectedSize === size && dynamicStyles.sizeButtonSelected]}>
                  <Text style={[dynamicStyles.sizeText, selectedSize === size && dynamicStyles.sizeTextSelected]}>{size}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={dynamicStyles.quantitySection}>
            <View><Text style={dynamicStyles.sectionTitle}>Số lượng</Text><Text style={dynamicStyles.quantityHint}>Chọn số sản phẩm muốn mua</Text></View>
            <View style={dynamicStyles.quantityControl}>
              <Pressable style={[dynamicStyles.quantityButton, quantity <= 1 && dynamicStyles.quantityButtonDisabled]} disabled={quantity <= 1} onPress={() => setQuantity((current) => Math.max(1, current - 1))}><Ionicons name="remove" size={19} color={theme.text} /></Pressable>
              <Text style={dynamicStyles.quantityText}>{quantity}</Text>
              <Pressable style={dynamicStyles.quantityButton} onPress={() => setQuantity((current) => Math.min(99, current + 1))}><Ionicons name="add" size={19} color={theme.text} /></Pressable>
            </View>
          </View>

          <Pressable style={dynamicStyles.aiCard} onPress={() => router.push("/chat")}>
            <View style={dynamicStyles.aiIcon}><Ionicons name="sparkles" size={22} color="#FFFFFF" /></View>
            <View style={dynamicStyles.aiTextContainer}><Text style={dynamicStyles.aiTitle}>Chưa biết có hợp với da?</Text><Text style={dynamicStyles.aiDescription}>Hỏi chuyên gia AI BeautyTech ngay để được tư vấn.</Text></View>
            <Ionicons name="chevron-forward" size={19} color={theme.primary} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={dynamicStyles.bottomBar}>
        <Pressable style={dynamicStyles.bottomIconButton} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={22} color={theme.primary} />
          <Text style={dynamicStyles.bottomIconText}>Giỏ hàng</Text>
        </Pressable>
        <Pressable style={dynamicStyles.addCartButton} onPress={handleAddToCart}>
          <Ionicons name="bag-add-outline" size={20} color="#FFFFFF" />
          <Text style={dynamicStyles.addCartText}>Thêm vào giỏ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingBottom: 100 },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
  imageContainer: { marginHorizontal: 20, height: 330, borderRadius: 25, overflow: 'hidden', backgroundColor: theme.isDark ? '#333' : '#F5E6EA', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  productTag: { position: 'absolute', top: 15, left: 15, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.card },
  productTagText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5, color: theme.primary },
  imageFavorite: { position: 'absolute', top: 13, right: 13, width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card },
  content: { paddingHorizontal: 22, paddingTop: 22 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: theme.primary, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: theme.text, fontWeight: '800' },
  productName: { marginTop: 12, fontSize: 27, lineHeight: 34, fontWeight: '900', color: theme.text, letterSpacing: -0.5 },
  productSubtitle: { marginTop: 5, fontSize: 13, color: theme.textMuted },
  priceContainer: { marginTop: 17, flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { fontSize: 23, fontWeight: '900', color: theme.primary },
  priceBadge: { backgroundColor: theme.isDark ? '#442A32' : '#F8E4E9', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  priceBadgeText: { fontSize: 10, fontWeight: '800', color: theme.primary },
  divider: { height: 1, backgroundColor: theme.border, marginTop: 23 },
  section: { marginTop: 23 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: theme.text },
  description: { marginTop: 10, fontSize: 12, lineHeight: 21, color: theme.textMuted },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedSizeText: { fontSize: 11, fontWeight: '700', color: theme.primary },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 13 },
  sizeButton: { minWidth: 76, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  sizeButtonSelected: { backgroundColor: theme.isDark ? '#442A32' : '#F8E4E9', borderColor: theme.primary },
  sizeText: { fontSize: 12, fontWeight: '700', color: theme.textMuted },
  sizeTextSelected: { color: theme.primary },
  quantitySection: { marginTop: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityHint: { marginTop: 5, fontSize: 10, color: theme.textMuted },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 5, borderRadius: 13, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  quantityButton: { width: 33, height: 33, borderRadius: 10, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' },
  quantityButtonDisabled: { opacity: 0.45 },
  quantityText: { minWidth: 15, textAlign: 'center', fontSize: 14, fontWeight: '900', color: theme.text },
  aiCard: { marginTop: 22, padding: 15, borderRadius: 18, backgroundColor: theme.isDark ? '#2A2A2A' : '#F5E8DF', flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  aiTextContainer: { flex: 1 },
  aiTitle: { fontSize: 12, fontWeight: '900', color: theme.text },
  aiDescription: { marginTop: 5, fontSize: 10, lineHeight: 16, color: theme.textMuted },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border, position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomIconButton: { width: 75, alignItems: 'center', justifyContent: 'center', gap: 4 },
  bottomIconText: { fontSize: 9, fontWeight: '700', color: theme.primary },
  addCartButton: { flex: 1, minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: theme.primary, borderRadius: 15 },
  addCartText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});