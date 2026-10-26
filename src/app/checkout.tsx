import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput, Image, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../presentation/contexts/CartContext';

const MOCK_VOUCHERS = [
  { id: 'v1', code: 'NEWBIE20', title: 'Giảm 20.000đ', discount: 20000, minSpend: 0 },
  { id: 'v2', code: 'BEAUTY50', title: 'Giảm 50.000đ', discount: 50000, minSpend: 200000 },
  { id: 'v3', code: 'VIP100', title: 'Giảm 100.000đ', discount: 100000, minSpend: 500000 },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, clearCart } = useCart();

  const selectedItems = cart.filter(item => item.selected);
  const subTotal = selectedItems.reduce((sum, item) => sum + (item.priceValue * item.quantity), 0);

  const [address, setAddress] = useState('123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [shipping, setShipping] = useState<'fast' | 'slow'>('fast');
  const shippingFee = shipping === 'fast' ? 30000 : 15000;

  const [payment, setPayment] = useState<'cod' | 'qr'>('cod');
  const [isPaid, setIsPaid] = useState(false);

  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

  const availableVouchers = useMemo(() => {
    return MOCK_VOUCHERS.filter(v => subTotal >= v.minSpend);
  }, [subTotal]);

  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  const totalPrice = Math.max(0, subTotal + shippingFee - discountAmount);

  const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

  const handleApplyVoucher = (voucher: any) => {
    if (appliedVoucher?.id === voucher.id) {
      setAppliedVoucher(null);
    } else {
      setAppliedVoucher(voucher);
    }
  };

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Lỗi', 'Không có sản phẩm nào để thanh toán! Vui lòng quay lại giỏ hàng.');
      return;
    }
    if (!address.trim()) { 
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ giao hàng!'); 
      return; 
    }

    try {
      const newOrder = {
        id: 'ORD' + Math.floor(Math.random() * 1000000),
        date: new Date().toISOString(),
        items: selectedItems,
        subTotal: subTotal,
        shippingFee: shippingFee,
        discount: discountAmount,
        total: totalPrice,
        address,
        paymentMethod: payment,
        paymentStatus: payment === 'qr' ? (isPaid ? 'paid' : 'pending') : 'unpaid',
        orderStatus: 'pending', // Thêm trạng thái đơn hàng mặc định
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
        Alert.alert(
          'Đặt hàng thành công',
          'Cảm ơn bạn đã mua sắm tại BeautyTech. Đơn hàng của bạn đang được xử lý!',
          [{ text: 'Về trang chủ', onPress: () => router.replace('/home') }]
        );
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}>
          <Ionicons name="chevron-back" size={24} color="#49313C" />
        </Pressable>
        <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ĐỊA CHỈ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="location" size={20} color="#BC6280" /><Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text></View>
            <Pressable onPress={() => setIsEditingAddress(!isEditingAddress)}><Text style={styles.editText}>{isEditingAddress ? 'Lưu' : 'Sửa'}</Text></Pressable>
          </View>
          {isEditingAddress ? (
            <TextInput style={styles.addressInput} value={address} onChangeText={setAddress} multiline placeholder="Nhập địa chỉ..." />
          ) : (
            <Text style={styles.addressText}>{address}</Text>
          )}
        </View>

        {/* MÃ ƯU ĐÃI */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="ticket" size={20} color="#BC6280" />
              <Text style={styles.sectionTitle}>Mã ưu đãi</Text>
            </View>
          </View>
          
          {availableVouchers.length > 0 ? (
            availableVouchers.map((voucher) => {
              const isApplied = appliedVoucher?.id === voucher.id;
              return (
                <View key={voucher.id} style={[styles.voucherRow, isApplied && styles.voucherRowApplied]}>
                  <View style={styles.voucherLeft}>
                    <View style={styles.voucherIconBox}>
                      <Ionicons name="pricetag" size={20} color="#FFF" />
                    </View>
                    <View>
                      <Text style={styles.voucherTitle}>{voucher.title}</Text>
                      <Text style={styles.voucherCode}>Mã: {voucher.code}</Text>
                    </View>
                  </View>
                  <Pressable 
                    style={[styles.applyBtn, isApplied && styles.applyBtnActive]} 
                    onPress={() => handleApplyVoucher(voucher)}
                  >
                    <Text style={[styles.applyBtnText, isApplied && { color: '#4CAF50' }]}>
                      {isApplied ? 'Đang dùng' : 'Áp dụng'}
                    </Text>
                  </Pressable>
                </View>
              );
            })
          ) : (
            <Text style={{ color: '#888', fontSize: 13, fontStyle: 'italic' }}>Chưa có mã ưu đãi phù hợp với đơn hàng này.</Text>
          )}
        </View>

        {/* VẬN CHUYỂN */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="cube" size={20} color="#BC6280" /><Text style={styles.sectionTitle}>Phương thức vận chuyển</Text></View></View>
          <Pressable style={styles.optionRow} onPress={() => setShipping('fast')}>
            <View style={styles.radioRow}><Ionicons name={shipping === 'fast' ? "radio-button-on" : "radio-button-off"} size={22} color="#BC6280" /><View><Text style={styles.optionTitle}>Giao hàng Nhanh</Text><Text style={styles.optionSub}>Dự kiến 1-2 ngày</Text></View></View>
            <Text style={styles.optionPrice}>+30.000đ</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.optionRow} onPress={() => setShipping('slow')}>
            <View style={styles.radioRow}><Ionicons name={shipping === 'slow' ? "radio-button-on" : "radio-button-off"} size={22} color="#BC6280" /><View><Text style={styles.optionTitle}>Giao hàng Tiết kiệm</Text><Text style={styles.optionSub}>Dự kiến 3-5 ngày</Text></View></View>
            <Text style={styles.optionPrice}>+15.000đ</Text>
          </Pressable>
        </View>

        {/* THANH TOÁN */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="wallet" size={20} color="#BC6280" /><Text style={styles.sectionTitle}>Phương thức thanh toán</Text></View></View>
          <Pressable style={styles.optionRow} onPress={() => setPayment('cod')}>
            <View style={styles.radioRow}><Ionicons name={payment === 'cod' ? "radio-button-on" : "radio-button-off"} size={22} color="#BC6280" /><Text style={styles.optionTitle}>Thanh toán khi nhận hàng (COD)</Text></View>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.optionRow} onPress={() => setPayment('qr')}>
            <View style={styles.radioRow}><Ionicons name={payment === 'qr' ? "radio-button-on" : "radio-button-off"} size={22} color="#BC6280" /><Text style={styles.optionTitle}>Chuyển khoản QR Code</Text></View>
          </Pressable>

          {payment === 'qr' && (
            <View style={styles.qrContainer}>
              {isPaid ? (
                <View style={styles.paidBox}>
                  <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
                  <Text style={styles.paidText}>Đã xác nhận chuyển khoản</Text>
                </View>
              ) : (
                <>
                  <Image source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BeautyTechPayment' }} style={styles.qrImage} />
                  <Text style={styles.qrText}>Quét mã để thanh toán</Text>
                  <Pressable style={styles.confirmPaidBtn} onPress={() => setIsPaid(true)}>
                    <Text style={styles.confirmPaidText}>Tôi đã chuyển khoản</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>

        {/* TÓM TẮT */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Sản phẩm ({selectedItems.length})</Text></View>
          {selectedItems.map((item) => (
            <View key={item.id} style={styles.summaryItem}>
              <Image source={{ uri: item.image }} style={styles.summaryImage} />
              <View style={{ flex: 1, marginLeft: 10 }}><Text style={styles.summaryName} numberOfLines={1}>{item.name}</Text><Text style={styles.summarySize}>{item.size}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={styles.summaryPrice}>{item.price}</Text><Text style={styles.summaryQty}>x{item.quantity}</Text></View>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.feeRow}><Text style={styles.feeLabel}>Tổng tiền hàng:</Text><Text style={styles.feeValue}>{formatPrice(subTotal)}</Text></View>
          <View style={styles.feeRow}><Text style={styles.feeLabel}>Phí vận chuyển:</Text><Text style={styles.feeValue}>+{formatPrice(shippingFee)}</Text></View>
          
          {appliedVoucher && (
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: '#4CAF50' }]}>Mã ưu đãi ({appliedVoucher.code}):</Text>
              <Text style={[styles.feeValue, { color: '#4CAF50' }]}>-{formatPrice(discountAmount)}</Text>
            </View>
          )}
          
          <View style={styles.divider} />
          <View style={styles.feeRow}><Text style={styles.totalLabel}>Tổng thanh toán:</Text><Text style={styles.totalValue}>{formatPrice(totalPrice)}</Text></View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}><Text style={styles.bottomPriceLabel}>Tổng cộng:</Text><Text style={styles.bottomPriceValue}>{formatPrice(totalPrice)}</Text></View>
        <Pressable style={[styles.placeOrderBtn, selectedItems.length === 0 && { opacity: 0.5 }]} disabled={selectedItems.length === 0} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Đặt hàng</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFAF8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#49313C' },
  content: { padding: 20, paddingBottom: 100 },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F0DDE4' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#49313C' },
  editText: { color: '#BC6280', fontWeight: '700', fontSize: 14 },
  addressText: { fontSize: 14, color: '#555', lineHeight: 22 },
  addressInput: { backgroundColor: '#F9F9F9', padding: 12, borderRadius: 10, fontSize: 14, color: '#49313C', borderWidth: 1, borderColor: '#EEE' },
  
  voucherRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9F9F9', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  voucherRowApplied: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  voucherLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  voucherIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#BC6280', alignItems: 'center', justifyContent: 'center' },
  voucherTitle: { fontSize: 14, fontWeight: '800', color: '#49313C' },
  voucherCode: { fontSize: 12, color: '#888', marginTop: 2 },
  applyBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#BC6280', backgroundColor: '#FFF' },
  applyBtnActive: { borderColor: '#4CAF50', backgroundColor: '#FFF' },
  applyBtnText: { fontSize: 12, fontWeight: '700', color: '#BC6280' },

  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionTitle: { fontSize: 14, fontWeight: '700', color: '#49313C' },
  optionSub: { fontSize: 12, color: '#888', marginTop: 2 },
  optionPrice: { fontSize: 14, fontWeight: '700', color: '#BC6280' },
  divider: { height: 1, backgroundColor: '#F0E4E8', marginVertical: 10 },
  
  qrContainer: { alignItems: 'center', marginTop: 15, padding: 15, backgroundColor: '#F9F9F9', borderRadius: 10 },
  qrImage: { width: 180, height: 180 },
  qrText: { marginTop: 10, color: '#888', fontSize: 13, marginBottom: 15 },
  confirmPaidBtn: { backgroundColor: '#E8F5E9', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#4CAF50' },
  confirmPaidText: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },
  paidBox: { alignItems: 'center', padding: 20 },
  paidText: { color: '#4CAF50', fontWeight: '800', fontSize: 16, marginTop: 10 },
  
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  summaryImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F5ECEF' },
  summaryName: { fontSize: 14, fontWeight: '600', color: '#49313C' },
  summarySize: { fontSize: 12, color: '#888', marginTop: 4 },
  summaryPrice: { fontSize: 14, fontWeight: '700', color: '#BC6280' },
  summaryQty: { fontSize: 12, color: '#888', marginTop: 4 },
  
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  feeLabel: { fontSize: 14, color: '#666' },
  feeValue: { fontSize: 14, fontWeight: '600', color: '#49313C' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#49313C' },
  totalValue: { fontSize: 18, fontWeight: '900', color: '#BC6280' },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFF', padding: 20, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#F0DDE4', alignItems: 'center', justifyContent: 'space-between' },
  bottomPrice: { flex: 1 },
  bottomPriceLabel: { fontSize: 13, color: '#888' },
  bottomPriceValue: { fontSize: 20, fontWeight: '900', color: '#BC6280', marginTop: 4 },
  placeOrderBtn: { backgroundColor: '#BC6280', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  placeOrderText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});