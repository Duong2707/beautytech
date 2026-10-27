import React from 'react';
// @ts-ignore
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Image, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../presentation/contexts/ThemeContext';
import { useWishlist } from '../presentation/contexts/WishlistContext';
import { useAuth } from '../presentation/contexts/AuthContext';
import { useProducts } from '../presentation/hooks/useProducts';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80";

export default function WishlistScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist(); 
  const { products, loading } = useProducts(); // Lấy toàn bộ sản phẩm từ API/Database

  // 👇 LỌC: Chỉ lấy những sản phẩm có _id nằm trong mảng wishlistIds
  const favoriteProducts = products?.filter((product: any) => 
    wishlistIds.includes(product._id)
  ) || [];

  const handleRemoveWishlist = (e: any, productId: string) => {
    e.stopPropagation();
    if (!user) return;
    toggleWishlist(productId); // Bấm phát là nó tự xóa khỏi Context và biến mất khỏi danh sách
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      <View style={dynamicStyles.header}>
        <Pressable style={dynamicStyles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle}>Sản phẩm yêu thích</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : favoriteProducts.length === 0 ? (
          // 👇 TRẠNG THÁI RỖNG (Khi chưa thích sản phẩm nào)
          <View style={dynamicStyles.emptyState}>
            <Ionicons name="heart-dislike-outline" size={60} color={theme.textMuted} />
            <Text style={dynamicStyles.emptyText}>Bạn chưa yêu thích sản phẩm nào.</Text>
            <Pressable style={dynamicStyles.goShoppingBtn} onPress={() => router.replace('/products')}>
              <Text style={dynamicStyles.goShoppingText}>Khám phá ngay</Text>
            </Pressable>
          </View>
        ) : (
          // 👇 HIỂN THỊ DANH SÁCH SẢN PHẨM ĐÃ THÍCH
          <View style={dynamicStyles.grid}>
            {favoriteProducts.map((product: any) => (
              <Pressable 
                key={product._id} 
                style={dynamicStyles.card}
                onPress={() => router.push({ pathname: "/product-detail", params: { id: product._id } })}
              >
                <View style={dynamicStyles.imageWrap}>
                  <Image source={{ uri: product.image || FALLBACK_IMAGE }} style={dynamicStyles.image} />
                  
                  {/* Nút Bỏ thích (Trái tim đỏ đặc) */}
                  <Pressable 
                    style={dynamicStyles.favoriteBtn} 
                    onPress={(e) => handleRemoveWishlist(e, product._id)}
                  >
                    <Ionicons name="heart" size={20} color="#E91E63" />
                  </Pressable>
                </View>

                <Text style={dynamicStyles.name} numberOfLines={1}>{product.name}</Text>
                <Text style={dynamicStyles.brand} numberOfLines={1}>{product.brand}</Text>
                <Text style={dynamicStyles.price}>{product.price.toLocaleString('vi-VN')}đ</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  content: { padding: 20, paddingBottom: 50 },
  
  // Trạng thái rỗng
  emptyState: { alignItems: 'center', marginTop: 80, gap: 15 },
  emptyText: { color: theme.textMuted, fontSize: 15, fontWeight: '500' },
  goShoppingBtn: { marginTop: 10, backgroundColor: theme.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  goShoppingText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  // Lưới sản phẩm
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 15 },
  card: { width: '48%', backgroundColor: theme.card, borderRadius: 15, padding: 10, borderWidth: 1, borderColor: theme.border },
  imageWrap: { height: 150, borderRadius: 10, overflow: 'hidden', position: 'relative', backgroundColor: theme.isDark ? '#333' : '#F9F9F9' },
  image: { width: '100%', height: '100%' },
  
  favoriteBtn: { 
    position: 'absolute', top: 8, right: 8, 
    width: 32, height: 32, 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },

  name: { fontSize: 14, fontWeight: '700', color: theme.text, marginTop: 10 },
  brand: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '800', color: theme.primary, marginTop: 5 },
});