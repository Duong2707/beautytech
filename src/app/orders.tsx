import React, { useState, useCallback } from 'react';
// @ts-ignore
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Image, ActivityIndicator, Alert, Modal, TextInput, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../presentation/contexts/AuthContext';
import { fetchOrdersApi, updateOrderStatusApi, submitReviewApi, cancelOrderApi } from '../services/orderApi';

const TABS = ['Tất cả', 'Chờ xác nhận', 'Chờ lấy hàng', 'Chờ giao hàng', 'Đánh giá'];

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth(); 
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');

  const [showQR, setShowQR] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500); 
  };

  useFocusEffect(
    useCallback(() => {
      loadOrdersFromApi();
    }, [user])
  );

  const loadOrdersFromApi = async () => {
    try {
      setLoading(true);
      const res = await fetchOrdersApi();
      if (res.success) {
        const formattedOrders = res.data.map((o: any) => ({ ...o, id: o.orderId }));
        setOrders(formattedOrders);
      }
    } catch (e) {
      console.log('Lỗi tải đơn hàng', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (order: any) => {
    const confirmCancel = async () => {
      try {
        await cancelOrderApi(order.id);
        showToast(`Đã hủy đơn hàng ${order.id}`);
        loadOrdersFromApi();
      } catch (error) {
        Alert.alert("Lỗi", "Không thể hủy đơn hàng.");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc muốn hủy đơn hàng ${order.id}?`)) confirmCancel();
    } else {
      Alert.alert("Xác nhận", `Bạn có chắc muốn hủy đơn hàng ${order.id}?`, [
        { text: "Không", style: "cancel" },
        { text: "Hủy đơn", style: "destructive", onPress: confirmCancel }
      ]);
    }
  };

  // 🌟 Hàm xử lý khi khách hàng bấm "Đã nhận được hàng"
  const handleCustomerReceived = async (order: any) => {
    try {
      await updateOrderStatusApi(order.id, 'delivered');
      showToast(`Đã xác nhận nhận hàng đơn ${order.id}`);
      loadOrdersFromApi();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái.");
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder) return;
    try {
      await submitReviewApi(selectedOrder.id, rating, comment);
      setShowReview(false);
      showToast(`Cảm ơn bạn! Đánh giá đơn ${selectedOrder.id} đã được gửi.`);
      loadOrdersFromApi();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi đánh giá.");
    }
  };

  const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Chờ xác nhận') return order.orderStatus === 'pending';
    if (activeTab === 'Chờ lấy hàng') return order.orderStatus === 'confirmed';
    if (activeTab === 'Chờ giao hàng') return order.orderStatus === 'shipping';
    if (activeTab === 'Đánh giá') return order.orderStatus === 'delivered' || order.orderStatus === 'reviewed'; 
    return true;
  });

  const renderPaymentBadge = (order: any) => {
    if (order.paymentStatus === 'paid') {
      return (
        <View style={[styles.paymentBadge, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]}>
          <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
          <Text style={[styles.paymentBadgeText, { color: '#4CAF50' }]}>Đã thanh toán</Text>
        </View>
      );
    } else if (order.paymentMethod === 'qr' && order.paymentStatus === 'pending') {
      return (
        <View style={[styles.paymentBadge, { backgroundColor: '#FFF3E0', borderColor: '#FF9800' }]}>
          <Ionicons name="time" size={12} color="#FF9800" />
          <Text style={[styles.paymentBadgeText, { color: '#FF9800' }]}>Chưa thanh toán</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.paymentBadge, { backgroundColor: '#F5F5F5', borderColor: '#BDBDBD' }]}>
          <Ionicons name="cash-outline" size={12} color="#757575" />
          <Text style={[styles.paymentBadgeText, { color: '#757575' }]}>Thanh toán COD</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={{paddingTop: 30}} /> 
      {toastMessage !== '' && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/account')}>
          <Ionicons name="chevron-back" size={24} color="#49313C" />
        </Pressable>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {TABS.map((tab) => (
            <Pressable 
              key={tab} 
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#BC6280" style={{ marginTop: 50 }} />
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={60} color="#E8D5DC" />
            <Text style={styles.emptyText}>Không có đơn hàng nào trong mục này.</Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const isPendingQR = order.paymentMethod === 'qr' && order.paymentStatus === 'pending';
            
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>Mã ĐH: {order.id}</Text>
                    <View style={{ marginTop: 6 }}>{renderPaymentBadge(order)}</View>
                  </View>
                  <Text style={[styles.orderStatus, { 
                    color: order.orderStatus === 'cancelled' ? '#FF6B6B' : '#FF9800' 
                  }]}>
                    {order.orderStatus === 'pending' ? 'Chờ xác nhận' : 
                     order.orderStatus === 'confirmed' ? 'Chờ lấy hàng' : 
                     order.orderStatus === 'shipping' ? 'Chờ giao hàng' : 
                     order.orderStatus === 'cancelled' ? 'Đã hủy' :
                     order.orderStatus === 'delivered' ? 'Đã giao' : 'Hoàn thành'}
                  </Text>
                </View>
                
                {order.items && order.items.length > 0 && (
                  <View style={styles.itemPreview}>
                    <Image source={{ uri: order.items[0].image }} style={styles.itemImg} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.itemName} numberOfLines={1}>{order.items[0].name}</Text>
                      <Text style={styles.itemQty}>x{order.items[0].quantity}</Text>
                    </View>
                    {order.items.length > 1 && <Text style={styles.moreItems}>...và {order.items.length - 1} món khác</Text>}
                  </View>
                )}

                {order.orderStatus === 'reviewed' && (
                  <View style={styles.reviewedBox}>
                    <Text style={styles.reviewedTitle}>Đánh giá của bạn:</Text>
                    <View style={{ flexDirection: 'row', gap: 2, marginVertical: 4 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons key={star} name="star" size={14} color={star <= order.rating ? '#FFC107' : '#E0E0E0'} />
                      ))}
                    </View>
                    {order.comment ? <Text style={styles.reviewedText}>"{order.comment}"</Text> : null}
                  </View>
                )}

                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Tổng tiền:</Text>
                    <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
                    <Text style={styles.paymentMethodText}>
                      TT: {order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    {/* TRẠNG THÁI: CHỜ XÁC NHẬN */}
                    {order.orderStatus === 'pending' && (
                      isPendingQR ? (
                        <Pressable style={styles.payNowBtn} onPress={() => { setSelectedOrder(order); setShowQR(true); }}>
                          <Text style={styles.payNowText}>Thanh toán ngay</Text>
                        </Pressable>
                      ) : (
                        <Pressable style={[styles.simulateBtn, { backgroundColor: '#FFEBEE', borderColor: '#FF6B6B' }]} onPress={() => handleCancelOrder(order)}>
                          <Text style={[styles.simulateText, { color: '#FF6B6B' }]}>Hủy đơn hàng</Text>
                        </Pressable>
                      )
                    )}

                    {/* TRẠNG THÁI: CHỜ LẤY HÀNG (Khách hàng không cần bấm gì) */}
                    {order.orderStatus === 'confirmed' && (
                      <Text style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>Đang chờ Shipper lấy hàng...</Text>
                    )}

                    {/* TRẠNG THÁI: CHỜ GIAO HÀNG (Khách hàng bấm đã nhận hàng khi shipper tới) */}
                    {order.orderStatus === 'shipping' && (
                      <Pressable style={[styles.simulateBtn, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' }]} onPress={() => handleCustomerReceived(order)}>
                        <Text style={[styles.simulateText, { color: '#4CAF50' }]}>Đã nhận được hàng</Text>
                      </Pressable>
                    )}

                    {/* TRẠNG THÁI: ĐÃ GIAO */}
                    {order.orderStatus === 'delivered' && (
                      <Pressable style={styles.reviewBtn} onPress={() => { 
                        setSelectedOrder(order); setRating(5); setComment(''); setShowReview(true); 
                      }}>
                        <Ionicons name="star" size={16} color="#FFF" />
                        <Text style={styles.reviewBtnText}>Đánh giá ngay</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showQR} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thanh toán đơn hàng</Text>
              <Pressable onPress={() => setShowQR(false)}><Ionicons name="close" size={24} color="#49313C" /></Pressable>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginBottom: 15 }}>Quét mã QR để thanh toán</Text>
              <Image source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BeautyTechPayment' }} style={{ width: 200, height: 200 }} />
              <Pressable style={styles.confirmPaidBtn} onPress={() => setShowQR(false)}>
                <Text style={styles.confirmPaidText}>Đóng</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showReview} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh giá sản phẩm</Text>
              <Pressable onPress={() => setShowReview(false)}><Ionicons name="close" size={24} color="#49313C" /></Pressable>
            </View>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: '#888', marginBottom: 10 }}>Bạn thấy sản phẩm thế nào?</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setRating(star)}>
                    <Ionicons name={star <= rating ? "star" : "star-outline"} size={36} color="#FFC107" />
                  </Pressable>
                ))}
              </View>
            </View>
            <TextInput
              style={styles.reviewInput}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              multiline numberOfLines={4} value={comment} onChangeText={setComment}
            />
            <Pressable style={styles.submitReviewBtn} onPress={handleSubmitReview}>
              <Text style={styles.submitReviewText}>Gửi đánh giá</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFAF8' },
  toastContainer: { position: 'absolute', top: Platform.OS === 'web' ? 20 : 50, left: '5%', right: '5%', backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 9999, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
  toastText: { color: '#FFF', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#49313C' },
  tabContainer: { borderBottomWidth: 1, borderBottomColor: '#F0DDE4', backgroundColor: '#FFF' },
  tabScroll: { paddingHorizontal: 10 },
  tabBtn: { paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#BC6280' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#888' },
  tabTextActive: { color: '#BC6280', fontWeight: '800' },
  content: { padding: 15 },
  emptyState: { alignItems: 'center', marginTop: 50, gap: 15 },
  emptyText: { color: '#8A6C78', fontSize: 14, textAlign: 'center' },
  orderCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#F0DDE4' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F9F9F9', paddingBottom: 10 },
  orderId: { fontSize: 13, fontWeight: '700', color: '#888' },
  orderStatus: { fontSize: 13, fontWeight: '800' },
  paymentBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, gap: 4 },
  paymentBadgeText: { fontSize: 11, fontWeight: '700' },
  itemPreview: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  itemImg: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F5ECEF' },
  itemName: { fontSize: 14, fontWeight: '700', color: '#49313C' },
  itemQty: { fontSize: 12, color: '#888', marginTop: 4 },
  moreItems: { fontSize: 12, color: '#888' },
  reviewedBox: { backgroundColor: '#F9F9F9', padding: 10, borderRadius: 8, marginBottom: 15 },
  reviewedTitle: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 4 },
  reviewedText: { fontSize: 13, color: '#555', fontStyle: 'italic', marginTop: 4 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F9F9F9', paddingTop: 15 },
  totalLabel: { fontSize: 12, color: '#888' },
  totalValue: { fontSize: 16, fontWeight: '900', color: '#BC6280' },
  paymentMethodText: { fontSize: 11, color: '#888', marginTop: 4 },
  payNowBtn: { backgroundColor: '#FF9800', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  payNowText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  simulateBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#90CAF9' },
  simulateText: { color: '#1976D2', fontWeight: '700', fontSize: 12 },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFC107', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  reviewBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxWidth: 400, backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#49313C' },
  confirmPaidBtn: { backgroundColor: '#E8F5E9', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#4CAF50', marginTop: 20 },
  confirmPaidText: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },
  reviewInput: { backgroundColor: '#F9F9F9', borderRadius: 12, padding: 15, fontSize: 14, color: '#49313C', minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#EEE', marginBottom: 20 },
  submitReviewBtn: { backgroundColor: '#BC6280', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  submitReviewText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});