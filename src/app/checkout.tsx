import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput, Image, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../presentation/contexts/CartContext';
import { useTheme } from '../presentation/contexts/ThemeContext';

const MOCK_VOUCHERS = [
  { id: 'v1', code: 'NEWBIE20', title: 'Giảm 20.000đ', discount: 20000, minSpend: 0 },
  { id: 'v2', code: 'BEAUTY50', title: 'Giảm 50.000đ', discount: 50000, minSpend: 200000 },
  { id: 'v3', code: 'VIP100', title: 'Giảm 100.000đ', discount: 100000, minSpend: 500000 },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { theme } = useTheme();

  const selectedItems = cart.filter(item => item.selected);
  const subTotal = selectedItems.reduce((sum, item) => sum + (item.priceValue * item.quantity), 0);

  const [address, setAddress] = useState('123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [shipping, setShipping] = useState<'fast' | 'slow'>('fast');
  const shippingFee = shipping === 'fast' ? 30000 : 15000;
  const [payment, setPayment] = useState<'cod' | 'qr'>('cod');
  const [isPaid, setIsPaid] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

  const availableVouchers = useMemo(() => MOCK_VOUCHERS.filter(v => subTotal >= v.minSpend), [subTotal]);
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const totalPrice = Math.max(0, subTotal + shippingFee - discountAmount);

  const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

  const handleApplyVoucher = (voucher: any) => {
    if (appliedVoucher?.id === voucher.id) setAppliedVoucher(null);
    else setAppliedVoucher(voucher);
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) { Alert.alert('Lỗi', 'Không có sản phẩm nào để thanh toán!'); return; }
    if (!address.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng!'); return; }

    try {
      const newOrder = {
        id: 'ORD' + Math.floor(Math.random() * 1000000),
        date: new Date().toISOString(),
        items: selectedItems,
        subTotal, shippingFee, discount: discountAmount, total: totalPrice,
        address, paymentMethod: payment,
        paymentStatus: payment === 'qr' ? (isPaid ? 'paid' : 'pending') : 'unpaid',
        orderStatus: 'pending',
      };

      const existingOrders = await AsyncStorage.getItem('@orders');
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      orders.unshift(newOrder);
      await AsyncStorage.setItem('@orders', JSON.stringify(orders));

      clearCart(); 
      
      if (Platform.OS === 'web') {
        window.alert('Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại BeautyTech.');
        router.replace('/home'); 
      } else {
        Alert.alert('Đặt hàng thành công', 'Cảm ơn bạn đã mua sắm!', [{ text: 'Về trang chủ', onPress: () => router.replace('/home') }]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng.');
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      <View style={dynamicStyles.header}>
        <Pressable style={dynamicStyles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle}>Xác nhận đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        <View style={dynamicStyles.sectionCard}>
          <View style={dynamicStyles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="location" size={20} color={theme.primary} /><Text style={dynamicStyles.sectionTitle}>Địa chỉ giao hàng</Text></View>
            <Pressable onPress={() => setIsEditingAddress(!isEditingAddress)}><Text style={dynamicStyles.editText}>{isEditingAddress ? 'Lưu' : 'Sửa'}</Text></Pressable>
          </View>
          {isEditingAddress ? <TextInput style={dynamicStyles.addressInput} value={address} onChangeText={setAddress} multiline placeholder="Nhập địa chỉ..." placeholderTextColor={theme.textMuted} /> : <Text style={dynamicStyles.addressText}>{address}</Text>}
        </View>

        <View style={dynamicStyles.sectionCard}>
          <View style={dynamicStyles.sectionHeader}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="ticket" size={20} color={theme.primary} /><Text style={dynamicStyles.sectionTitle}>Mã ưu đãi</Text></View></View>
          {availableVouchers.length > 0 ? availableVouchers.map((voucher) => {
              const isApplied = appliedVoucher?.id === voucher.id;
              return (
                <View key={voucher.id} style={[dynamicStyles.voucherRow, isApplied && dynamicStyles.voucherRowApplied]}>
                  <View style={dynamicStyles.voucherLeft}>
                    <View style={dynamicStyles.voucherIconBox}><Ionicons name="pricetag" size={20} color="#FFF" /></View>
                    <View><Text style={dynamicStyles.voucherTitle}>{voucher.title}</Text><Text style={dynamicStyles.voucherCode}>Mã: {voucher.code}</Text></View>
                  </View>
                  <Pressable style={[dynamicStyles.applyBtn, isApplied && dynamicStyles.applyBtnActive]} onPress={() => handleApplyVoucher(voucher)}>
                    <Text style={[dynamicStyles.applyBtnText, isApplied && { color: '#4CAF50' }]}>{isApplied ? 'Đang dùng' : 'Áp dụng'}</Text>
                  </Pressable>
                </View>
              );
          }) : <Text style={{ color: theme.textMuted, fontSize: 13, fontStyle: 'italic' }}>Chưa có mã ưu đãi phù hợp.</Text>}
        </View>

        <View style={dynamicStyles.sectionCard}>
          <View style={dynamicStyles.sectionHeader}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="cube" size={20} color={theme.primary} /><Text style={dynamicStyles.sectionTitle}>Phương thức vận chuyển</Text></View></View>
          <Pressable style={dynamicStyles.optionRow} onPress={() => setShipping('fast')}>
            <View style={dynamicStyles.radioRow}><Ionicons name={shipping === 'fast' ? "radio-button-on" : "radio-button-off"} size={22} color={theme.primary} /><View><Text style={dynamicStyles.optionTitle}>Giao hàng Nhanh</Text><Text style={dynamicStyles.optionSub}>Dự kiến 1-2 ngày</Text></View></View>
            <Text style={dynamicStyles.optionPrice}>+30.000đ</Text>
          </Pressable>
          <View style={dynamicStyles.divider} />
          <Pressable style={dynamicStyles.optionRow} onPress={() => setShipping('slow')}>
            <View style={dynamicStyles.radioRow}><Ionicons name={shipping === 'slow' ? "radio-button-on" : "radio-button-off"} size={22} color={theme.primary} /><View><Text style={dynamicStyles.optionTitle}>Giao hàng Tiết kiệm</Text><Text style={dynamicStyles.optionSub}>Dự kiến 3-5 ngày</Text></View></View>
            <Text style={dynamicStyles.optionPrice}>+15.000đ</Text>
          </Pressable>
        </View>

        <View style={dynamicStyles.sectionCard}>
          <View style={dynamicStyles.sectionHeader}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="wallet" size={20} color={theme.primary} /><Text style={dynamicStyles.sectionTitle}>Thanh toán</Text></View></View>
          <Pressable style={dynamicStyles.optionRow} onPress={() => setPayment('cod')}>
            <View style={dynamicStyles.radioRow}><Ionicons name={payment === 'cod' ? "radio-button-on" : "radio-button-off"} size={22} color={theme.primary} /><Text style={dynamicStyles.optionTitle}>Thanh toán khi nhận hàng (COD)</Text></View>
          </Pressable>
          <View style={dynamicStyles.divider} />
          <Pressable style={dynamicStyles.optionRow} onPress={() => setPayment('qr')}>
            <View style={dynamicStyles.radioRow}><Ionicons name={payment === 'qr' ? "radio-button-on" : "radio-button-off"} size={22} color={theme.primary} /><Text style={dynamicStyles.optionTitle}>Chuyển khoản QR Code</Text></View>
          </Pressable>
          {payment === 'qr' && (
            <View style={dynamicStyles.qrContainer}>
              {isPaid ? (
                <View style={dynamicStyles.paidBox}><Ionicons name="checkmark-circle" size={50} color="#4CAF50" /><Text style={dynamicStyles.paidText}>Đã xác nhận chuyển khoản</Text></View>
              ) : (
                <><Image source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BeautyTechPayment' }} style={dynamicStyles.qrImage} /><Text style={dynamicStyles.qrText}>Quét mã để thanh toán</Text><Pressable style={dynamicStyles.confirmPaidBtn} onPress={() => setIsPaid(true)}><Text style={dynamicStyles.confirmPaidText}>Tôi đã chuyển khoản</Text></Pressable></>
              )}
            </View>
          )}
        </View>

        <View style={dynamicStyles.sectionCard}>
          <View style={dynamicStyles.sectionHeader}><Text style={dynamicStyles.sectionTitle}>Sản phẩm ({selectedItems.length})</Text></View>
          {selectedItems.map((item) => (
            <View key={item.id} style={dynamicStyles.summaryItem}>
              <Image source={{ uri: item.image }} style={dynamicStyles.summaryImage} />
              <View style={{ flex: 1, marginLeft: 10 }}><Text style={dynamicStyles.summaryName} numberOfLines={1}>{item.name}</Text><Text style={dynamicStyles.summarySize}>{item.size}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={dynamicStyles.summaryPrice}>{item.price}</Text><Text style={dynamicStyles.summaryQty}>x{item.quantity}</Text></View>
            </View>
          ))}
          <View style={dynamicStyles.divider} />
          <View style={dynamicStyles.feeRow}><Text style={dynamicStyles.feeLabel}>Tổng tiền hàng:</Text><Text style={dynamicStyles.feeValue}>{formatPrice(subTotal)}</Text></View>
          <View style={dynamicStyles.feeRow}><Text style={dynamicStyles.feeLabel}>Phí vận chuyển:</Text><Text style={dynamicStyles.feeValue}>+{formatPrice(shippingFee)}</Text></View>
          {appliedVoucher && (<View style={dynamicStyles.feeRow}><Text style={[dynamicStyles.feeLabel, { color: '#4CAF50' }]}>Mã ưu đãi:</Text><Text style={[dynamicStyles.feeValue, { color: '#4CAF50' }]}>-{formatPrice(discountAmount)}</Text></View>)}
          <View style={dynamicStyles.divider} />
          <View style={dynamicStyles.feeRow}><Text style={dynamicStyles.totalLabel}>Tổng thanh toán:</Text><Text style={dynamicStyles.totalValue}>{formatPrice(totalPrice)}</Text></View>
        </View>
      </ScrollView>

      <View style={dynamicStyles.bottomBar}>
        <View style={dynamicStyles.bottomPrice}><Text style={dynamicStyles.bottomPriceLabel}>Tổng cộng:</Text><Text style={dynamicStyles.bottomPriceValue}>{formatPrice(totalPrice)}</Text></View>
        <Pressable style={[dynamicStyles.placeOrderBtn, selectedItems.length === 0 && { opacity: 0.5 }]} disabled={selectedItems.length === 0} onPress={handlePlaceOrder}><Text style={dynamicStyles.placeOrderText}>Đặt hàng</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  content: { padding: 20, paddingBottom: 100 },
  sectionCard: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: theme.text },
  editText: { color: theme.primary, fontWeight: '700', fontSize: 14 },
  addressText: { fontSize: 14, color: theme.text, lineHeight: 22 },
  addressInput: { backgroundColor: theme.background, padding: 12, borderRadius: 10, fontSize: 14, color: theme.text, borderWidth: 1, borderColor: theme.border },
  voucherRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.background, padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  voucherRowApplied: { borderColor: '#4CAF50', backgroundColor: theme.isDark ? '#1E3320' : '#E8F5E9' },
  voucherLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  voucherIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  voucherTitle: { fontSize: 14, fontWeight: '800', color: theme.text },
  voucherCode: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  applyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: theme.primary, backgroundColor: theme.background },
  applyBtnActive: { borderColor: '#4CAF50', backgroundColor: theme.background },
  applyBtnText: { fontSize: 12, fontWeight: '700', color: theme.primary },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionTitle: { fontSize: 14, fontWeight: '700', color: theme.text },
  optionSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  optionPrice: { fontSize: 14, fontWeight: '700', color: theme.primary },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 10 },
  qrContainer: { alignItems: 'center', marginTop: 15, padding: 15, backgroundColor: theme.background, borderRadius: 10 },
  qrImage: { width: 180, height: 180 },
  qrText: { marginTop: 10, color: theme.textMuted, fontSize: 13, marginBottom: 15 },
  confirmPaidBtn: { backgroundColor: theme.isDark ? '#1E3320' : '#E8F5E9', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#4CAF50' },
  confirmPaidText: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },
  paidBox: { alignItems: 'center', padding: 20 },
  paidText: { color: '#4CAF50', fontWeight: '800', fontSize: 16, marginTop: 10 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  summaryImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: theme.isDark ? '#333' : '#F5ECEF' },
  summaryName: { fontSize: 14, fontWeight: '600', color: theme.text },
  summarySize: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
  summaryPrice: { fontSize: 14, fontWeight: '700', color: theme.primary },
  summaryQty: { fontSize: 12, color: theme.textMuted, marginTop: 4 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  feeLabel: { fontSize: 14, color: theme.textMuted },
  feeValue: { fontSize: 14, fontWeight: '600', color: theme.text },
  totalLabel: { fontSize: 16, fontWeight: '800', color: theme.text },
  totalValue: { fontSize: 18, fontWeight: '900', color: theme.primary },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: theme.card, padding: 20, paddingBottom: 20, borderTopWidth: 1, borderTopColor: theme.border, alignItems: 'center', justifyContent: 'space-between' },
  bottomPrice: { flex: 1 },
  bottomPriceLabel: { fontSize: 13, color: theme.textMuted },
  bottomPriceValue: { fontSize: 20, fontWeight: '900', color: theme.primary, marginTop: 4 },
  placeOrderBtn: { backgroundColor: theme.primary, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  placeOrderText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});