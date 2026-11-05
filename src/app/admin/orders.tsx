import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { fetchOrdersApi, updateOrderStatusApi } from "../../services/orderApi";

const PINK = "#E88BA8";
const DARK = "#30242A";
const MUTED = "#8E858A";
const BG = "#FFF8FA";

// 🌟 CẬP NHẬT TYPE ĐỂ NHẬN THÊM RATING VÀ COMMENT
type Order = {
  _id: string;
  orderId: string;
  recipientName: string;
  phone: string;
  address: string;
  items: { name: string; quantity: number; price: number; image: string }[];
  total: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  rating?: number;   // Thêm trường này
  comment?: string;  // Thêm trường này
};

const menuItems = [
  { label: "Tổng quan", icon: "grid-outline", route: "/admin" },
  { label: "Sản phẩm", icon: "cube-outline", route: "/admin/products" },
  { label: "Đơn hàng", icon: "receipt-outline", route: "/admin/orders" },
//  { label: "Shipper", icon: "bicycle-outline", route: "/admin/shippers" },
  { label: "Voucher", icon: "ticket-outline", route: "/admin/vouchers" },
  { label: "Thông báo", icon: "notifications-outline", route: "/admin/notifications" },
];

const filters = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đã xác nhận", value: "confirmed" },
  { label: "Đang giao", value: "shipping" },
  { label: "Đã giao", value: "delivered" },
  { label: "Đã hủy", value: "cancelled" },
];

const formatMoney = (value: number) => value.toLocaleString("vi-VN") + "đ";

const statusInfo: Record<string, { label: string; color: string; background: string }> = {
  pending: { label: "Chờ xác nhận", color: "#B7791F", background: "#FFF4D9" },
  confirmed: { label: "Đã xác nhận", color: "#2563EB", background: "#EAF1FF" },
  shipping: { label: "Đang giao", color: "#0D9488", background: "#E0F7F3" },
  delivered: { label: "Đã giao", color: "#15803D", background: "#E5F7E9" },
  reviewed: { label: "Đã đánh giá", color: "#8B5CF6", background: "#F3E8FF" },
  cancelled: { label: "Đã hủy", color: "#DC2626", background: "#FEECEC" },
};

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [menuVisible, setMenuVisible] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shipperModal, setShipperModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetchOrdersApi();
      if (res.success) {
        const sortedOrders = res.data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      }
    } catch (e) {
      console.log("Lỗi tải đơn hàng admin:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesKeyword =
        (order.orderId && order.orderId.toLowerCase().includes(search)) ||
        (order.recipientName && order.recipientName.toLowerCase().includes(search)) ||
        (order.phone && order.phone.includes(search));

      const matchesFilter = filter === "all" || order.orderStatus === filter;

      return matchesKeyword && matchesFilter;
    });
  }, [orders, keyword, filter]);

  const navigateTo = (route: string) => {
    setMenuVisible(false);
    router.push(route as any);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string, successMsg: string) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      Alert.alert("Thành công", successMsg);
      setSelectedOrder(null);
      setShipperModal(false);
      loadOrders();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng.");
    }
  };

  const confirmOrder = (order: Order) => {
    handleUpdateStatus(order.orderId, "confirmed", `Đã xác nhận đơn ${order.orderId}`);
  };

  const rejectOrder = (order: Order) => {
    Alert.alert(
      "Từ chối đơn hàng",
      `Bạn có chắc muốn từ chối đơn ${order.orderId}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Từ chối",
          style: "destructive",
          onPress: () => handleUpdateStatus(order.orderId, "cancelled", `Đã từ chối đơn ${order.orderId}`),
        },
      ]
    );
  };

  const handleShipOrder = (order: Order) => {
    setSelectedOrder(order);
    setShipperModal(true);
  };

  const renderAction = (order: Order) => {
    if (order.orderStatus === "pending") {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.confirmButton} onPress={() => confirmOrder(order)}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={() => rejectOrder(order)}>
            <Text style={styles.rejectText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (order.orderStatus === "confirmed") {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.assignButton} onPress={() => handleShipOrder(order)}>
            <Ionicons name="bicycle-outline" size={16} color={PINK} />
            <Text style={styles.assignText}>Giao cho Shipper</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (order.orderStatus === "shipping") {
      return (
        <Text style={{ fontSize: 11, color: '#0D9488', fontStyle: 'italic', fontWeight: '600' }}>
          Đang giao đến khách...
        </Text>
      );
    }

    if (order.orderStatus === "delivered") {
      return (
        <Text style={{ fontSize: 11, color: '#15803D', fontStyle: 'italic', fontWeight: '600' }}>
          Khách đã nhận hàng
        </Text>
      );
    }

    return <Text style={styles.noAction}>Không có thao tác</Text>;
  };

  const renderSidebar = () => (
    <View style={[styles.sidebar, isMobile && styles.mobileSidebar]}>
      <View style={{paddingTop: 30}} /> 
      <View style={styles.logoArea}>
        <View style={styles.logoRow}>
          <Ionicons name="flower-outline" size={27} color={PINK} />
          <Text style={styles.logo}>BeautyTech.</Text>
        </View>
        <Text style={styles.logoSub}>ADMIN PANEL</Text>
      </View>
      <Text style={styles.menuHeading}>MENU CHÍNH</Text>
      {menuItems.map((item) => {
        const active = item.route === "/admin/orders";
        return (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, active && styles.menuActive]}
            onPress={() => navigateTo(item.route)}
          >
            <Ionicons name={item.icon as any} size={20} color={active ? PINK : MUTED} />
            <Text style={[styles.menuText, active && styles.menuTextActive]}>{item.label}</Text>
            {active && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
      <View style={styles.sidebarBottom}>
        <View style={styles.adminProfile}>
          <View style={styles.adminAvatar}>
            <Ionicons name="person" size={19} color={PINK} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminName}>Administrator</Text>
            <Text style={styles.adminRole}>Quản trị viên</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace("/login")}>
          <Ionicons name="log-out-outline" size={20} color="#C45B83" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const statistics = [
    { label: "Tổng đơn hàng", value: orders.length, icon: "receipt-outline" as const },
    { label: "Chờ xác nhận", value: orders.filter((o) => o.orderStatus === "pending").length, icon: "time-outline" as const },
    { label: "Đang giao", value: orders.filter((o) => o.orderStatus === "shipping").length, icon: "bicycle-outline" as const },
    { label: "Đã giao", value: orders.filter((o) => o.orderStatus === "delivered" || o.orderStatus === "reviewed").length, icon: "checkmark-circle-outline" as const },
  ];

  return (
    <View style={styles.container}>
      {!isMobile && renderSidebar()}
            {isMobile && menuVisible && (
        <>
          <Pressable 
            style={styles.mobileBackdrop} 
            onPress={() => setMenuVisible(false)} 
          />
          <View style={styles.mobileMenuWrapper}>{renderSidebar()}</View>
        </>
      )}

      <View style={styles.main}>
        <View style={{paddingTop: 10}} /> 
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <View style={styles.header}>
            {isMobile && (
              <TouchableOpacity style={styles.mobileMenuButton} onPress={() => setMenuVisible(!menuVisible)}>
                <Ionicons name={menuVisible ? "close" : "menu"} size={25} color={DARK} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.pageTitle}>Quản lý đơn hàng</Text>
              <Text style={styles.subtitle}>Theo dõi và xử lý đơn hàng của khách hàng</Text>
            </View>
            <Text style={styles.pageTitle}></Text>
          </View>

          <View style={styles.stats}>
            {statistics.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon} size={23} color={PINK} />
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Danh sách đơn hàng</Text>

            <View style={styles.searchWrapper}>
              <Ionicons name="search-outline" size={19} color="#AAAAAA" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm mã đơn, tên khách hàng hoặc số điện thoại..."
                placeholderTextColor="#AAAAAA"
                value={keyword}
                onChangeText={setKeyword}
              />
              {!!keyword && (
                <TouchableOpacity onPress={() => setKeyword("")}>
                  <Ionicons name="close-circle" size={18} color={MUTED} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {filters.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.filterButton, filter === item.value && styles.filterActive]}
                  onPress={() => setFilter(item.value)}
                >
                  <Text style={[styles.filterText, filter === item.value && styles.filterTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>{filteredOrders.length} đơn hàng</Text>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={PINK} style={{ marginTop: 20 }} />
            ) : filteredOrders.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="file-tray-outline" size={40} color="#CCCCCC" />
                <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
              </View>
            ) : (
              filteredOrders.map((order) => {
                const status = statusInfo[order.orderStatus] || statusInfo.pending;

                return (
                  <View key={order._id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                      <View style={styles.orderIdentity}>
                        <View style={styles.orderIcon}>
                          <Ionicons name="receipt-outline" size={22} color={PINK} />
                        </View>
                        <View style={styles.orderTitleArea}>
                          <Text style={styles.orderId}>#{order.orderId}</Text>
                          <Text style={styles.orderCustomer}>{order.recipientName}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                      </View>
                    </View>

                    <View style={styles.infoList}>
                      {order.items && order.items.length > 0 && (
                        <View style={styles.infoRow}>
                          <Ionicons name="bag-outline" size={16} color="#999999" />
                          <Text style={styles.infoText}>
                            {order.items[0].name} × {order.items[0].quantity}
                            {order.items.length > 1 ? ` (và ${order.items.length - 1} SP khác)` : ""}
                          </Text>
                        </View>
                      )}
                      <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={16} color="#999999" />
                        <Text style={styles.infoText}>{order.phone}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color="#999999" />
                        <Text style={styles.infoText}>{order.address}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Ionicons name="card-outline" size={16} color="#999999" />
                        <Text style={styles.infoText}>
                          TT: {order.paymentMethod === "cod" ? "Thanh toán COD" : "Chuyển khoản QR"}
                        </Text>
                      </View>
                    </View>

                    {/* 🌟 KHỐI HIỂN THỊ ĐÁNH GIÁ CỦA KHÁCH HÀNG */}
                    {order.orderStatus === 'reviewed' && (
                      <View style={styles.reviewBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Ionicons name="chatbubble-ellipses-outline" size={16} color="#8B5CF6" />
                          <Text style={styles.reviewTitle}>Đánh giá từ khách hàng:</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 2, marginVertical: 4 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons key={star} name="star" size={14} color={star <= (order.rating || 0) ? '#FFC107' : '#E0E0E0'} />
                          ))}
                        </View>
                        {order.comment ? (
                          <Text style={styles.reviewComment}>"{order.comment}"</Text>
                        ) : (
                          <Text style={[styles.reviewComment, { fontStyle: 'italic', color: '#999' }]}>Khách hàng không để lại bình luận.</Text>
                        )}
                      </View>
                    )}

                    <View style={styles.orderBottom}>
                      <View>
                        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                        <Text style={styles.totalValue}>{formatMoney(order.total)}</Text>
                      </View>
                      <View style={styles.actions}>{renderAction(order)}</View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      <Modal visible={shipperModal} transparent animationType="fade" onRequestClose={() => setShipperModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                <Ionicons name="bicycle-outline" size={24} color={PINK} />
              </View>
              <TouchableOpacity onPress={() => setShipperModal(false)}>
                <Ionicons name="close" size={23} color={MUTED} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>Giao cho Shipper</Text>
            <Text style={styles.modalSubtitle}>
              Xác nhận chuyển đơn {selectedOrder?.orderId} cho đơn vị vận chuyển?
            </Text>
            <TouchableOpacity
              style={styles.confirmShipButton}
              onPress={() => {
                if (selectedOrder) {
                  handleUpdateStatus(selectedOrder.orderId, "shipping", `Đơn ${selectedOrder.orderId} đang được giao`);
                }
              }}
            >
              <Text style={styles.confirmShipText}>Xác nhận Giao hàng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShipperModal(false)}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Giữ nguyên toàn bộ style cũ) ...
  container: { flex: 1, flexDirection: 'row', backgroundColor: BG },
  sidebar: { width: 250, backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingTop: 30, paddingBottom: 15, borderRightWidth: 1, borderRightColor: '#F3E9ED' },
  mobileSidebar: { width: 250, height: '100%', elevation: 5 },
   mobileBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)', // Lớp phủ mờ
    zIndex: 19, // Nằm dưới sidebar (zIndex 20) nhưng trên nội dung chính
  },
  mobileMenuWrapper: { position: 'absolute', zIndex: 20, top: 0, bottom: 0, left: 0 },
  logoArea: { marginBottom: 35, paddingHorizontal: 7 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logo: { fontSize: 22, fontWeight: '800', color: PINK },
  logoSub: { fontSize: 10, color: MUTED, letterSpacing: 2, marginTop: 5, marginLeft: 35 },
  menuHeading: { fontSize: 10, fontWeight: '700', color: '#B0A5AA', letterSpacing: 1.5, marginBottom: 12, marginLeft: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 12, borderRadius: 11, marginBottom: 6, gap: 11 },
  menuActive: { backgroundColor: '#FCEEF2' },
  menuText: { fontSize: 13, color: MUTED, fontWeight: '500', flex: 1 },
  menuTextActive: { color: PINK, fontWeight: '700' },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PINK },
  sidebarBottom: { marginTop: 'auto', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F3E9ED' },
  adminProfile: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 5, marginBottom: 12 },
  adminAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FCEEF2', justifyContent: 'center', alignItems: 'center' },
  adminName: { fontSize: 12, fontWeight: '700', color: DARK },
  adminRole: { fontSize: 10, color: MUTED, marginTop: 3 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, gap: 10 },
  logoutText: { fontSize: 13, color: '#C45B83', fontWeight: '600' },
  main: { flex: 1, minWidth: 0, paddingHorizontal: 25, paddingTop: 28 },
  scrollContent: { paddingBottom: 30 },
  mobileMenuButton: { width: 42, height: 42, borderRadius: 11, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#F3E9ED' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 25 },
  pageTitle: { fontSize: 25, fontWeight: '800', color: DARK },
  subtitle: { color: MUTED, fontSize: 13, marginTop: 6 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, minWidth: 120, backgroundColor: '#FFFFFF', borderRadius: 15, padding: 17, borderWidth: 1, borderColor: '#F4E8ED' },
  statNumber: { fontSize: 25, fontWeight: '800', color: DARK, marginTop: 10 },
  statLabel: { color: MUTED, fontSize: 12, marginTop: 4 },
  contentCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 18, borderWidth: 1, borderColor: '#F4E8ED', marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: DARK, marginBottom: 16 },
  searchWrapper: { height: 45, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EEE3E8', borderRadius: 11, paddingHorizontal: 12, marginBottom: 17, backgroundColor: '#FFFCFD', gap: 8 },
  searchInput: { flex: 1, height: '100%', fontSize: 13, color: DARK, outlineStyle: 'none' as any },
  filterScroll: { marginBottom: 16 },
  filterButton: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#F7F4F5', marginRight: 8 },
  filterActive: { backgroundColor: PINK },
  filterText: { color: '#777777', fontSize: 12 },
  filterTextActive: { color: '#FFFFFF', fontWeight: '700' },
  listHeader: { borderBottomWidth: 1, borderBottomColor: '#F1E8EC', paddingBottom: 12, marginBottom: 14 },
  listHeaderText: { color: MUTED, fontSize: 12, fontWeight: '600' },
  orderCard: { borderWidth: 1, borderColor: '#F0E6EA', borderRadius: 14, padding: 16, marginBottom: 13 },
  orderHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderIdentity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  orderIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FCEEF2', justifyContent: 'center', alignItems: 'center' },
  orderTitleArea: { flex: 1, minWidth: 0 },
  orderId: { color: PINK, fontSize: 13, fontWeight: '800' },
  orderCustomer: { color: DARK, fontSize: 14, fontWeight: '800', marginTop: 4 },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 9, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '700' },
  infoList: { marginTop: 15, gap: 9 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  infoText: { color: '#666666', fontSize: 12, flex: 1 },
  orderBottom: { borderTopWidth: 1, borderTopColor: '#F1E8EC', paddingTop: 13, marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  totalLabel: { fontSize: 11, color: MUTED },
  totalValue: { fontSize: 17, color: '#C45B83', fontWeight: '800', marginTop: 3 },
  actions: { flexDirection: 'row', flexWrap: 'wrap' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  confirmButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: PINK, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  rejectButton: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, backgroundColor: '#FEECEC' },
  rejectText: { color: '#DC2626', fontSize: 11, fontWeight: '700' },
  assignButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FCEEF2', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8 },
  assignText: { color: '#C45B83', fontSize: 11, fontWeight: '700' },
  handoverButton: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8, backgroundColor: '#E5F7E9' },
  handoverText: { color: '#15803D', fontSize: 11, fontWeight: '700' },
  noAction: { color: '#AAAAAA', fontSize: 11 },
  empty: { alignItems: 'center', padding: 35 },
  emptyText: { color: MUTED, marginTop: 10, fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  modalCard: { width: '100%', maxWidth: 440, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 22, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalIcon: { width: 43, height: 43, borderRadius: 13, backgroundColor: '#FCEEF2', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: DARK },
  modalSubtitle: { color: MUTED, fontSize: 12, marginTop: 6, marginBottom: 18 },
  confirmShipButton: { backgroundColor: PINK, padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  confirmShipText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  cancelButton: { padding: 12, alignItems: 'center' },
  cancelText: { color: MUTED, fontWeight: '600' },

  // 🌟 STYLE MỚI CHO HỘP ĐÁNH GIÁ
  reviewBox: {
    backgroundColor: '#F9F5FF', // Màu tím nhạt
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#E9D8FD',
  },
  reviewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B5CF6', // Màu tím đậm
  },
  reviewComment: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 18,
  },
});