import React, { useState, useMemo, useEffect, useCallback } from 'react';
// @ts-ignore
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../presentation/contexts/CartContext';
import { useTheme } from '../presentation/contexts/ThemeContext';
import { useAuth } from '../presentation/contexts/AuthContext';
import { fetchAddresses } from '../services/addressApi';
import { createOrderApi } from '../services/orderApi';
import api from '../data/datasources/remote/api'; // Thêm api để check thanh toán và lấy voucher

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80";

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cart, removeSelectedFromCart } = useCart();
  const { theme } = useTheme();
  const { user } = useAuth(); 

  const selectedItems = cart.filter(item => item.selected);
  const subTotal = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const [currentAddress, setCurrentAddress] = useState<any>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  const [shipping, setShipping] = useState<'fast' | 'slow'>('fast');
  const shippingFee = shipping === 'fast' ? 30000 : 15000;
  const [payment, setPayment] = useState<'cod' | 'qr'>('cod');
  const [isPaid, setIsPaid] = useState(false);
  
  // 🌟 STATE QUẢN LÝ VOUCHER TỪ DATABASE
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);

  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  useEffect(() => {
    setCurrentOrderId('ORD' + Math.floor(Math.random() * 1000000));
    loadVouchers(); // Load voucher khi mở trang
  }, []);

  const loadVouchers = async () => {
    try {
      const res = await api.get('/api/vouchers');
      // Chỉ lấy voucher active và chưa hết hạn
      const validVouchers = (res.data.data || res.data).filter((v: any) => 
        v.active && new Date(v.expiry) >= new Date() && v.quantity > v.used
      );
      setVouchers(validVouchers);
    } catch (error) {
      console.log("Lỗi tải voucher:", error);
    }
  };

  // 1. TỰ ĐỘNG LẤY ĐỊA CHỈ MẶC ĐỊNH
  useFocusEffect(
    useCallback(() => {
      const loadDefaultAddress = async () => {
        try {
          setIsLoadingAddress(true);
          const addresses = await fetchAddresses();
          if (addresses && addresses.length > 0) {
            const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
            setCurrentAddress(defaultAddr);
          } else {
            setCurrentAddress({ address: 'Vui lòng thêm địa chỉ giao hàng' });
          }
        } catch (error) {
          console.log("Lỗi lấy địa chỉ:", error);
          setCurrentAddress({ address: 'Lỗi tải địa chỉ' });
        } finally {
          setIsLoadingAddress(false);
        }
      };
      loadDefaultAddress();
    }, [])
  );

  // 2. ÁP DỤNG VOUCHER (Từ params hoặc từ AsyncStorage)
  useEffect(() => {
    const checkAndApplyVoucher = async () => {
      let codeToApply = params.voucherCode;
      if (!codeToApply) {
        const savedCode = await AsyncStorage.getItem('@pendingVoucher');
        if (savedCode) {
          codeToApply = savedCode;
          await AsyncStorage.removeItem('@pendingVoucher');
        }
      }
      if (codeToApply && vouchers.length > 0) {
        const voucherToApply = vouchers.find(v => v.code === codeToApply);
        if (voucherToApply && subTotal >= voucherToApply.minOrder) {
          setAppliedVoucher(voucherToApply);
        }
      }
    };
    checkAndApplyVoucher();
  }, [params.voucherCode, subTotal, vouchers]);

  // 3. POLLING KIỂM TRA THANH TOÁN
  useEffect(() => {
    let interval: any;
    if (payment === 'qr' && !isPaid && currentOrderId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/api/payment/check-status/${currentOrderId}`);
          if (res.data?.status === 'paid') {
            setIsPaid(true); 
            clearInterval(interval); 
          }
        } catch (error) {}
      }, 3000); 
    }
    return () => clearInterval(interval);
  }, [payment, isPaid, currentOrderId]);

  // 4. TỰ ĐỘNG ĐẶT HÀNG KHI THANH TOÁN THÀNH CÔNG
  useEffect(() => {
    if (isPaid && payment === 'qr' && !isOrderPlaced) {
      const timer = setTimeout(() => {
        setIsOrderPlaced(true); 
        handlePlaceOrder(true); 
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [isPaid, payment, isOrderPlaced]);

  // Lọc voucher phù hợp với đơn hàng hiện tại
  const availableVouchers = useMemo(() => vouchers.filter(v => subTotal >= v.minOrder), [vouchers, subTotal]);
  
  // 🌟 TÍNH TOÁN GIẢM GIÁ THEO % HOẶC TIỀN MẶT
  const discountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.type === 'percent') {
      return (subTotal * appliedVoucher.value) / 100;
    }
    return appliedVoucher.value;
  }, [appliedVoucher, subTotal]);

  const totalPrice = Math.max(0, subTotal + shippingFee - discountAmount);

  const formatPrice = (price: number) => Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

  const handleApplyVoucher = (voucher: any) => {
    if (appliedVoucher?._id === voucher._id) setAppliedVoucher(null);
    else setAppliedVoucher(voucher);
  };

  const generateVietQRLink = () => {
    const bankId = "BIDV"; 
    const accountNo = "96247059776"; 
    const accountName = "TRAN NHAT LUAN"; 
    const amount = Math.round(totalPrice); 
    const addInfo = currentOrderId || "Thanh toan don hang"; 
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;
  };

  const handlePlaceOrder = async (isAuto = false) => {
    if (selectedItems.length === 0) { 
      if (!isAuto) Alert.alert('Lỗi', 'Không có sản phẩm nào để thanh toán!'); 
      return; 
    }
    if (!currentAddress || currentAddress.address === 'Vui lòng thêm địa chỉ giao hàng') {
      Alert.alert('Lỗi', 'Vui lòng chọn địa chỉ giao hàng!'); return; 
    }
    
    const finalPhone = currentAddress?.phone || user?.phone;
    if (!finalPhone) { 
      Alert.alert('Lỗi', 'Vui lòng cập nhật số điện thoại nhận hàng!'); 
      return; 
    }

    try {
      const finalRecipientName = currentAddress?.name || user?.fullName || 'Khách hàng';

      const newOrder = {
        orderId: currentOrderId || ('ORD' + Math.floor(Math.random() * 1000000)),
        recipientName: finalRecipientName,
        phone: finalPhone,
        items: selectedItems.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image || FALLBACK_IMAGE,
          quantity: item.quantity,
          size: item.size
        })),
        subTotal: subTotal, 
        shippingFee: shippingFee, 
        discount: discountAmount, 
        total: totalPrice,
        address: currentAddress.address,
        paymentMethod: payment,
        paymentStatus: payment === 'qr' ? (isPaid ? 'paid' : 'pending') : 'unpaid',
        orderStatus: 'pending',
      };

      await createOrderApi(newOrder); 
      await removeSelectedFromCart(); 
      
      if (Platform.OS === 'web') {
        if (!isAuto) window.alert('Đặt hàng thành công!');
        router.replace('/home'); 
      } else {
        if (!isAuto) {
          Alert.alert('Đặt hàng thành công', 'Cảm ơn bạn đã mua sắm!', [{ text: 'Về trang chủ', onPress: () => router.replace('/home') }]);
        } else {
          router.replace('/home');
        }
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      if (Platform.OS === 'web') window.alert('Có lỗi xảy ra khi lưu đơn hàng, vui lòng kiểm tra Console (F12)!');
      else Alert.alert('Lỗi', 'Không thể tạo đơn hàng.');
      setIsOrderPlaced(false); 
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      <View style={dynamicStyles.header}>
        <Pressable style={dynamicStyles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/cart')}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle}>Xác nhận đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        
        {/* ĐỊA CHỈ */}
        <View style={dynamicStyles.sectionCard}>
          <View style={dynamicStyles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="location" size={20} color={theme.primary} />
              <Text style={dynamicStyles.sectionTitle}>Địa chỉ giao hàng</Text>
            </View>
            <Pressable onPress={() => router.push('/shipping-address?selectMode=true')}>
              <Text style={dynamicStyles.editText}>Quản lý / Thay đổi</Text>
            </Pressable>
          </View>

          {isLoadingAddress ? (
             <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} />
          ) : (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 14, color: theme.textMuted, width: 110 }}>Người nhận:</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text, flex: 1 }}>
                  {currentAddress?.name || user?.fullName || 'Khách hàng'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 14, color: theme.textMuted, width: 110 }}>Số điện thoại:</Text>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text, flex: 1 }}>
                  {currentAddress?.phone || user?.phone || 'Chưa có SĐT'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 14, color: theme.textMuted, width: 110 }}>Địa chỉ:</Text>
                <Text style={{ fontSize: 14, color: theme.text, flex: 1, lineHeight: 22 }}>
                  {currentAddress?.address || 'Chưa có địa chỉ'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* VOUCHER */}
        <View style={dynamicStyles.sectionCard}>
          <View style={dynamicStyles.sectionHeader}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="ticket" size={20} color={theme.primary} /><Text style={dynamicStyles.sectionTitle}>Mã ưu đãi</Text></View></View>
          {availableVouchers.length > 0 ? availableVouchers.map((voucher) => {
              const isApplied = appliedVoucher?._id === voucher._id;
              const title = voucher.type === 'percent' ? `Giảm ${voucher.value}%` : `Giảm ${formatPrice(voucher.value)}`;
              return (
                <View key={voucher._id} style={[dynamicStyles.voucherRow, isApplied && dynamicStyles.voucherRowApplied]}>
                  <View style={dynamicStyles.voucherLeft}>
                    <View style={dynamicStyles.voucherIconBox}><Ionicons name="pricetag" size={20} color="#FFF" /></View>
                    <View><Text style={dynamicStyles.voucherTitle}>{title}</Text><Text style={dynamicStyles.voucherCode}>Mã: {voucher.code}</Text></View>
                  </View>
                  <Pressable style={[dynamicStyles.applyBtn, isApplied && dynamicStyles.applyBtnActive]} onPress={() => handleApplyVoucher(voucher)}>
                    <Text style={[dynamicStyles.applyBtnText, isApplied && { color: '#4CAF50' }]}>{isApplied ? 'Đang dùng' : 'Áp dụng'}</Text>
                  </Pressable>
                </View>
              );
          }) : <Text style={{ color: theme.textMuted, fontSize: 13, fontStyle: 'italic' }}>Không có mã ưu đãi phù hợp.</Text>}
        </View>

        {/* VẬN CHUYỂN, THANH TOÁN, SẢN PHẨM (Giữ nguyên như cũ) */}
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
                <View style={dynamicStyles.paidBox}>
                  <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
                  <Text style={dynamicStyles.paidText}>Đã xác nhận chuyển khoản</Text>
                  <Text style={{color: theme.primary, marginTop: 5, fontSize: 13}}>Đang tự động đặt hàng...</Text>
                </View>
              ) : (
                <>
                  <Image source={{ uri: generateVietQRLink() }} style={[dynamicStyles.qrImage, { width: 250, height: 250 }]} resizeMode="contain" />
                  <Text style={dynamicStyles.qrText}>Quét mã để thanh toán (Nội dung: {currentOrderId})</Text>
                  <Pressable style={dynamicStyles.confirmPaidBtn} onPress={() => setIsPaid(true)}>
                    <Text style={dynamicStyles.confirmPaidText}>Tôi đã chuyển khoản</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>

        <View style={dynamicStyles.sectionCard}>
          <View style={dynamicStyles.sectionHeader}><Text style={dynamicStyles.sectionTitle}>Sản phẩm ({selectedItems.length})</Text></View>
          {selectedItems.map((item) => (
            <View key={item._id} style={dynamicStyles.summaryItem}>
              <Image source={{ uri: item.product?.image || FALLBACK_IMAGE }} style={dynamicStyles.summaryImage} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={dynamicStyles.summaryName} numberOfLines={1}>{item.product?.name}</Text>
                <Text style={dynamicStyles.summarySize}>{item.size}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={dynamicStyles.summaryPrice}>{item.product?.price.toLocaleString('vi-VN')}đ</Text>
                <Text style={dynamicStyles.summaryQty}>x{item.quantity}</Text>
              </View>
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
        <Pressable 
          style={[dynamicStyles.placeOrderBtn, (selectedItems.length === 0 || isOrderPlaced) && { opacity: 0.5 }]} 
          disabled={selectedItems.length === 0 || isOrderPlaced} 
          onPress={() => handlePlaceOrder(false)}
        >
          <Text style={dynamicStyles.placeOrderText}>{isOrderPlaced ? 'Đang xử lý...' : 'Đặt hàng'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Giữ nguyên toàn bộ Styles cũ của bạn
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
  qrText: { marginTop: 10, color: theme.textMuted, fontSize: 13, marginBottom: 15, textAlign: 'center' },
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