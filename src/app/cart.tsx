import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, SafeAreaView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../presentation/contexts/CartContext';

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
  const { cart, removeSelectedFromCart, clearCart, updateQuantity, toggleSelect, toggleSelectAll } = useCart();

  const selectedItems = cart.filter(item => item.selected);
  const totalPrice = selectedItems.reduce((sum, item) => sum + (item.priceValue * item.quantity), 0);
  const isAllSelected = cart.length > 0 && cart.every(item => item.selected);

  const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    showConfirm('Xóa mục đã chọn', `Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`, () => removeSelectedFromCart());
  };

  const handleClearAll = () => {
    showConfirm('Xóa tất cả', 'Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?', () => clearCart());
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}>
          <Ionicons name="chevron-back" size={24} color="#49313C" />
        </Pressable>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        {/* Đã bỏ nút Xóa tất cả ở đây để tránh trùng lặp */}
        <View style={{ width: 40 }} />
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color="#E8D5DC" />
          <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
          <Pressable style={styles.shopNowBtn} onPress={() => router.replace('/products')}>
            <Text style={styles.shopNowText}>Mua sắm ngay</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.selectAllRow}>
              <Pressable style={styles.checkbox} onPress={() => toggleSelectAll(!isAllSelected)}>
                <Ionicons name={isAllSelected ? "checkbox" : "square-outline"} size={24} color={isAllSelected ? "#BC6280" : "#8A6C78"} />
                <Text style={styles.selectAllText}>Chọn tất cả ({cart.length})</Text>
              </Pressable>
              
              {/* LOGIC MỚI: Hiển thị nút Xóa thông minh */}
              {isAllSelected ? (
                <Pressable onPress={handleClearAll} style={styles.deleteActionBtn}>
                  <Ionicons name="trash" size={16} color="#FF6B6B" />
                  <Text style={styles.deleteActionText}>Xóa tất cả</Text>
                </Pressable>
              ) : selectedItems.length > 0 ? (
                <Pressable onPress={handleDeleteSelected} style={styles.deleteActionBtn}>
                  <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
                  <Text style={styles.deleteActionText}>Xóa ({selectedItems.length})</Text>
                </Pressable>
              ) : null}
            </View>

            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Pressable style={styles.itemCheckbox} onPress={() => toggleSelect(item.id)}>
                  <Ionicons name={item.selected ? "checkbox" : "square-outline"} size={22} color={item.selected ? "#BC6280" : "#8A6C78"} />
                </Pressable>

                <Image source={{ uri: item.image }} style={styles.itemImage} />
                
                <View style={styles.itemInfo}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  </View>
                  
                  {item.size ? <Text style={styles.itemSize}>Phân loại: {item.size}</Text> : null}
                  
                  <View style={styles.bottomRow}>
                    <Text style={styles.itemPrice}>{item.price}</Text>
                    <View style={styles.quantityContainer}>
                      <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Ionicons name="remove" size={16} color="#49313C" />
                      </Pressable>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <Pressable style={styles.qtyBtn} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Ionicons name="add" size={16} color="#49313C" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.bottomBar}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
            </View>
                       <Pressable 
              style={[styles.checkoutBtn, selectedItems.length === 0 && { opacity: 0.5 }]} 
              disabled={selectedItems.length === 0}
              onPress={() => router.push('/checkout')} // <-- Sửa dòng này
            >
              <Text style={styles.checkoutText}>Mua hàng ({selectedItems.length})</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFAF8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: '#FFFAF8' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#49313C' },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#8A6C78', marginTop: 15, marginBottom: 20 },
  shopNowBtn: { backgroundColor: '#BC6280', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  shopNowText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  
  content: { padding: 20, paddingBottom: 100 },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0DDE4' },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectAllText: { fontSize: 14, fontWeight: '600', color: '#49313C' },
  
  // Style cho nút Xóa thông minh
  deleteActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  deleteActionText: { color: '#FF6B6B', fontSize: 13, fontWeight: '700' },
  
  cartItem: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 15, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#F0DDE4', alignItems: 'center' },
  itemCheckbox: { marginRight: 10 },
  itemImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#F5ECEF' },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 14, fontWeight: '700', color: '#49313C', flex: 1, marginRight: 10 },
  itemSize: { fontSize: 12, color: '#8A6C78', marginTop: 4 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#BC6280' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderRadius: 8, borderWidth: 1, borderColor: '#EEE' },
  qtyBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  qtyText: { fontSize: 14, fontWeight: '700', color: '#49313C', width: 25, textAlign: 'center' },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFF', padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopWidth: 1, borderTopColor: '#F0DDE4', alignItems: 'center', justifyContent: 'space-between' },
  totalContainer: { flex: 1 },
  totalLabel: { fontSize: 13, color: '#8A6C78' },
  totalPrice: { fontSize: 20, fontWeight: '900', color: '#BC6280', marginTop: 4 },
  checkoutBtn: { backgroundColor: '#BC6280', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 12 },
  checkoutText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});