import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image, Pressable, StyleSheet, StatusBar, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../presentation/contexts/CartContext'; 

const defaultProducts = [
  {
    name: 'Glow Serum', detail: 'Serum dưỡng sáng da', price: '259.000đ', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80', tag: 'BÁN CHẠY', description: 'Serum chăm sóc da hằng ngày, giúp làn da trông tươi tắn và rạng rỡ hơn. Phù hợp để bổ sung vào quy trình chăm sóc da cá nhân.', sizes: ['15ml', '30ml', '50ml'],
  },
  {
    name: 'Hydra Cream', detail: 'Kem dưỡng ẩm sâu', price: '320.000đ', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop&q=80', tag: 'YÊU THÍCH', description: 'Kem dưỡng ẩm cho quy trình chăm sóc da hằng ngày. Sử dụng sau bước làm sạch và các sản phẩm dưỡng da phù hợp.', sizes: ['30ml', '50ml', '80ml'],
  },
  // Bạn có thể thêm các sản phẩm khác tương tự ở đây...
];

export default function ProductDetailScreen() {
  const router = useRouter();
  const { addToCart } = useCart(); 
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
    
    // Truyền số lượng và size vào Giỏ hàng
    addToCart({
      id: name, 
      name: name,
      price: price,
      priceValue: priceValue,
      image: image,
    }, quantity, selectedSize);

    Alert.alert(
      'Đã thêm vào giỏ hàng',
      `${name}\nDung tích: ${selectedSize}\nSố lượng: ${quantity}\nGiá tham khảo: ${price}`,
      [
        { text: 'Tiếp tục mua sắm', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => router.push('/cart') },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFAF8" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/home")}>
            <Ionicons name="arrow-back" size={22} color="#49313C" />
          </Pressable>
          <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
          <Pressable style={styles.iconButton} onPress={() => setFavorite((value) => !value)}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? '#C15E80' : '#49313C'} />
          </Pressable>
        </View>

        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.productImage} resizeMode="cover" />
          <View style={styles.productTag}><Ionicons name="sparkles" size={12} color="#A65370" /><Text style={styles.productTagText}>{tag}</Text></View>
          <Pressable style={styles.imageFavorite} onPress={() => setFavorite((value) => !value)}><Ionicons name={favorite ? 'heart' : 'heart-outline'} size={23} color={favorite ? '#C15E80' : '#795965'} /></Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrow}>BEAUTYTECH COLLECTION</Text>
            <View style={styles.rating}><Ionicons name="star" size={14} color="#D9A24A" /><Text style={styles.ratingText}>4.9</Text></View>
          </View>
          <Text style={styles.productName}>{name}</Text>
          <Text style={styles.productSubtitle}>{detail}</Text>
          <View style={styles.priceContainer}><Text style={styles.price}>{price}</Text><View style={styles.priceBadge}><Text style={styles.priceBadgeText}>Ưu đãi</Text></View></View>
          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Dung tích / Phân loại</Text><Text style={styles.selectedSizeText}>{selectedSize}</Text></View>
            <View style={styles.sizeRow}>
              {product.sizes.map((size) => (
                <Pressable key={size} onPress={() => setSelectedSize(size)} style={[styles.sizeButton, selectedSize === size && styles.sizeButtonSelected]}>
                  <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextSelected]}>{size}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.quantitySection}>
            <View><Text style={styles.sectionTitle}>Số lượng</Text><Text style={styles.quantityHint}>Chọn số sản phẩm muốn mua</Text></View>
            <View style={styles.quantityControl}>
              <Pressable style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]} disabled={quantity <= 1} onPress={() => setQuantity((current) => Math.max(1, current - 1))}><Ionicons name="remove" size={19} color="#8D596D" /></Pressable>
              <Text style={styles.quantityText}>{quantity}</Text>
              <Pressable style={styles.quantityButton} onPress={() => setQuantity((current) => Math.min(99, current + 1))}><Ionicons name="add" size={19} color="#8D596D" /></Pressable>
            </View>
          </View>

          <Pressable style={styles.aiCard} onPress={() => router.push("/chat")}>
            <View style={styles.aiIcon}><Ionicons name="sparkles" size={22} color="#FFFFFF" /></View>
            <View style={styles.aiTextContainer}><Text style={styles.aiTitle}>Chưa biết có hợp với da?</Text><Text style={styles.aiDescription}>Hỏi chuyên gia AI BeautyTech ngay để được tư vấn.</Text></View>
            <Ionicons name="chevron-forward" size={19} color="#B65D7B" />
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.bottomIconButton} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={22} color="#B65D7B" />
          <Text style={styles.bottomIconText}>Giỏ hàng</Text>
        </Pressable>
        <Pressable style={styles.addCartButton} onPress={handleAddToCart}>
          <Ionicons name="bag-add-outline" size={20} color="#FFFFFF" />
          <Text style={styles.addCartText}>Thêm vào giỏ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFAF8' },
  scrollContent: { paddingBottom: 100 },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#49313C' },
  imageContainer: { marginHorizontal: 20, height: 330, borderRadius: 25, overflow: 'hidden', backgroundColor: '#F5E6EA', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  productTag: { position: 'absolute', top: 15, left: 15, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FFFFFFE8' },
  productTagText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5, color: '#A65370' },
  imageFavorite: { position: 'absolute', top: 13, right: 13, width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFFE8' },
  content: { paddingHorizontal: 22, paddingTop: 22 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: '#B16D83', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: '#634A56', fontWeight: '800' },
  productName: { marginTop: 12, fontSize: 27, lineHeight: 34, fontWeight: '900', color: '#49313C', letterSpacing: -0.5 },
  productSubtitle: { marginTop: 5, fontSize: 13, color: '#A18A94' },
  priceContainer: { marginTop: 17, flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { fontSize: 23, fontWeight: '900', color: '#BC5E7E' },
  priceBadge: { backgroundColor: '#F8E4E9', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  priceBadgeText: { fontSize: 10, fontWeight: '800', color: '#A65370' },
  divider: { height: 1, backgroundColor: '#F0E4E8', marginTop: 23 },
  section: { marginTop: 23 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#49313C' },
  description: { marginTop: 10, fontSize: 12, lineHeight: 21, color: '#856D78' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedSizeText: { fontSize: 11, fontWeight: '700', color: '#B65D7B' },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 13 },
  sizeButton: { minWidth: 76, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0E4E8' },
  sizeButtonSelected: { backgroundColor: '#F8E4E9', borderColor: '#BC6280' },
  sizeText: { fontSize: 12, fontWeight: '700', color: '#856D78' },
  sizeTextSelected: { color: '#A65370' },
  quantitySection: { marginTop: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityHint: { marginTop: 5, fontSize: 10, color: '#A18A94' },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 5, borderRadius: 13, backgroundColor: '#F8EDF0' },
  quantityButton: { width: 33, height: 33, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  quantityButtonDisabled: { opacity: 0.45 },
  quantityText: { minWidth: 15, textAlign: 'center', fontSize: 14, fontWeight: '900', color: '#49313C' },
  aiCard: { marginTop: 22, padding: 15, borderRadius: 18, backgroundColor: '#F5E8DF', flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: '#B66D7D', alignItems: 'center', justifyContent: 'center' },
  aiTextContainer: { flex: 1 },
  aiTitle: { fontSize: 12, fontWeight: '900', color: '#563C43' },
  aiDescription: { marginTop: 5, fontSize: 10, lineHeight: 16, color: '#876B70' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F2E6EA', position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomIconButton: { width: 75, alignItems: 'center', justifyContent: 'center', gap: 4 },
  bottomIconText: { fontSize: 9, fontWeight: '700', color: '#A65370' },
  addCartButton: { flex: 1, minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#BC6280', borderRadius: 15 },
  addCartText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
});