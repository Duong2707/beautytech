import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, SafeAreaView, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../presentation/contexts/CartContext';
import { useTheme } from '../presentation/contexts/ThemeContext';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80";

const showConfirm = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đồng ý', style: 'destructive', onPress: onConfirm }
    ]);
  }
};

export default function CartScreen() {
  const router = useRouter();
  const { cart, loadingCart, removeFromCart, removeSelectedFromCart, clearCart, updateQuantity, toggleSelect, toggleSelectAll } = useCart();
  const { theme } = useTheme();

  const selectedItems = cart.filter(item => item.selected);
  const totalPrice = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const isAllSelected = cart.length > 0 && cart.every(item => item.selected);

  const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

  const handleClearAll = () => {
    showConfirm('Xóa tất cả', 'Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?', () => clearCart());
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    showConfirm('Xóa mục đã chọn', `Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`, () => removeSelectedFromCart());
  };

  const dynamicStyles = getStyles(theme);

  if (loadingCart) {
    return (
      <View style={[dynamicStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      <View style={dynamicStyles.header}>
        <Pressable style={dynamicStyles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle}>Giỏ hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      {cart.length === 0 ? (
        <View style={dynamicStyles.emptyState}>
          <Ionicons name="cart-outline" size={80} color={theme.isDark ? '#333' : '#E8D5DC'} />
          <Text style={dynamicStyles.emptyText}>Giỏ hàng của bạn đang trống</Text>
          <Pressable style={dynamicStyles.shopNowBtn} onPress={() => router.replace('/products')}>
            <Text style={dynamicStyles.shopNowText}>Mua sắm ngay</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={dynamicStyles.content}>
            <View style={dynamicStyles.selectAllRow}>
              <Pressable style={dynamicStyles.checkbox} onPress={() => toggleSelectAll(!isAllSelected)}>
                <Ionicons name={isAllSelected ? "checkbox" : "square-outline"} size={24} color={isAllSelected ? theme.primary : theme.textMuted} />
                <Text style={dynamicStyles.selectAllText}>Chọn tất cả ({cart.length})</Text>
              </Pressable>
              
              {selectedItems.length > 0 && (
                <Pressable onPress={handleDeleteSelected} style={dynamicStyles.deleteActionBtn}>
                  <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                  <Text style={dynamicStyles.deleteActionText}>Xóa ({selectedItems.length})</Text>
                </Pressable>
              )}
            </View>

            {cart.map((item) => (
              <View key={item._id} style={dynamicStyles.cartItem}>
                <Pressable style={dynamicStyles.itemCheckbox} onPress={() => toggleSelect(item._id)}>
                  <Ionicons name={item.selected ? "checkbox" : "square-outline"} size={22} color={item.selected ? theme.primary : theme.textMuted} />
                </Pressable>

                <Image source={{ uri: item.product?.image || FALLBACK_IMAGE }} style={dynamicStyles.itemImage} />
                
                <View style={dynamicStyles.itemInfo}>
                  <View style={dynamicStyles.itemHeader}>
                    <Text style={dynamicStyles.itemName} numberOfLines={1}>{item.product?.name || 'Sản phẩm'}</Text>
                  </View>
                  
                  {item.size ? <Text style={dynamicStyles.itemSize}>Phân loại: {item.size}</Text> : null}
                  
                  <View style={dynamicStyles.bottomRow}>
                    <Text style={dynamicStyles.itemPrice}>{item.product?.price?.toLocaleString('vi-VN')}đ</Text>
                    <View style={dynamicStyles.quantityContainer}>
                      <Pressable style={dynamicStyles.qtyBtn} onPress={() => updateQuantity(item._id, item.quantity - 1)}>
                        <Ionicons name="remove" size={16} color={theme.text} />
                      </Pressable>
                      <Text style={dynamicStyles.qtyText}>{item.quantity}</Text>
                      <Pressable style={dynamicStyles.qtyBtn} onPress={() => updateQuantity(item._id, item.quantity + 1)}>
                        <Ionicons name="add" size={16} color={theme.text} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={dynamicStyles.bottomBar}>
            <View style={dynamicStyles.totalContainer}>
              <Text style={dynamicStyles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={dynamicStyles.totalPrice}>{formatPrice(totalPrice)}</Text>
            </View>
            <Pressable 
              style={[dynamicStyles.checkoutBtn, selectedItems.length === 0 && { opacity: 0.5 }]} 
              disabled={selectedItems.length === 0}
              onPress={() => router.push('/checkout')}
            >
              <Text style={dynamicStyles.checkoutText}>Mua hàng ({selectedItems.length})</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: theme.background },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: theme.textMuted, marginTop: 15, marginBottom: 20 },
  shopNowBtn: { backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  shopNowText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  content: { padding: 20, paddingBottom: 100 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: theme.border },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectAllText: { fontSize: 14, fontWeight: '600', color: theme.text },
  deleteActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.isDark ? '#331111' : '#FFF0F0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  deleteActionText: { color: '#FF6B6B', fontSize: 13, fontWeight: '700' },
  cartItem: { flexDirection: 'row', backgroundColor: theme.card, borderRadius: 15, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: theme.border, alignItems: 'center' },
  itemCheckbox: { marginRight: 10 },
  itemImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: theme.isDark ? '#333' : '#F5ECEF' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 14, fontWeight: '700', color: theme.text, flex: 1, marginRight: 10 },
  itemSize: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: theme.primary },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, borderRadius: 8, borderWidth: 1, borderColor: theme.border },
  qtyBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  qtyText: { fontSize: 14, fontWeight: '700', color: theme.text, width: 25, textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: theme.card, padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopWidth: 1, borderTopColor: theme.border, alignItems: 'center', justifyContent: 'space-between' },
  totalContainer: { flex: 1 },
  totalLabel: { fontSize: 13, color: theme.textMuted },
  totalPrice: { fontSize: 20, fontWeight: '900', color: theme.primary, marginTop: 4 },
  checkoutBtn: { backgroundColor: theme.primary, paddingHorizontal: 25, paddingVertical: 14, borderRadius: 12 },
  checkoutText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});