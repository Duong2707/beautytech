import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../data/datasources/remote/api';
import { fetchOrdersApi } from '../../services/orderApi';

const PINK = '#E88BA8';
const DARK = '#30242A';
const MUTED = '#8E858A';
const BG = '#FFF8FA';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const menuItems = [
  { label: 'Tổng quan', icon: 'grid-outline', route: '/admin' },
  { label: 'Sản phẩm', icon: 'cube-outline', route: '/admin/products' },
  { label: 'Đơn hàng', icon: 'receipt-outline', route: '/admin/orders' },
//  { label: 'Shipper', icon: 'bicycle-outline', route: '/admin/shippers' },
  { label: 'Voucher', icon: 'ticket-outline', route: '/admin/vouchers' },
  { label: 'Thông báo', icon: 'notifications-outline', route: '/admin/notifications' },
];

// Format tiền tệ
const formatMoney = (value: number) => {
  return value.toLocaleString('vi-VN') + 'đ';
};

// Hàm lấy màu và text theo trạng thái đơn hàng
const getOrderStatusInfo = (status: string) => {
  switch (status) {
    case 'pending': return { text: 'Chờ xác nhận', color: '#D99B4D' };
    case 'confirmed': return { text: 'Đã xác nhận', color: '#6596CF' };
    case 'shipping': return { text: 'Đang giao', color: '#6596CF' };
    case 'delivered': return { text: 'Đã giao', color: '#65A994' };
    case 'reviewed': return { text: 'Đã đánh giá', color: '#8B5CF6' };
    case 'cancelled': return { text: 'Đã hủy', color: '#DC2626' };
    default: return { text: 'Không rõ', color: MUTED };
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [menuVisible, setMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State chứa dữ liệu thật
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Gọi API khi mở trang
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Gọi đồng thời cả 2 API để tối ưu tốc độ
      const [ordersRes, productsRes] = await Promise.all([
        fetchOrdersApi(),
        api.get('/api/products')
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.data);
      }
      
      const prodData = productsRes.data.data || productsRes.data;
      setProducts(prodData);

    } catch (error) {
      console.log("Lỗi tải dữ liệu Dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ================= TÍNH TOÁN SỐ LIỆU THỰC TẾ =================
  const totalRevenue = orders
    .filter(o => o.orderStatus === 'delivered' || o.orderStatus === 'reviewed')
    .reduce((sum, o) => sum + o.total, 0);
    
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;

  const dynamicStats = [
    {
      title: 'Tổng doanh thu',
      value: formatMoney(totalRevenue),
      change: 'Từ đơn đã giao',
      icon: 'wallet-outline',
      color: '#E88BA8',
      bg: '#FCEAF0',
    },
    {
      title: 'Tổng đơn hàng',
      value: String(orders.length),
      change: 'Toàn bộ hệ thống',
      icon: 'receipt-outline',
      color: '#8B83D8',
      bg: '#F0EEFF',
    },
    {
      title: 'Sản phẩm',
      value: String(products.length),
      change: 'Đang quản lý',
      icon: 'cube-outline',
      color: '#65A994',
      bg: '#EAF7F2',
    },
    {
      title: 'Chờ xác nhận',
      value: String(pendingOrdersCount),
      change: 'Cần xử lý',
      icon: 'time-outline',
      color: '#D99B4D',
      bg: '#FFF4E5',
    },
  ];

  // Lấy 4 đơn hàng mới nhất
  const recentOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);

  const navigateTo = (route: string) => {
    setMenuVisible(false);
    router.push(route as any);
  };

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

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
        const active = item.route === '/admin';

        return (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, active && styles.menuActive]}
            onPress={() => navigateTo(item.route)}
          >
            <Ionicons name={item.icon as IconName} size={20} color={active ? PINK : MUTED} />
            <Text style={[styles.menuText, active && styles.menuTextActive]}>
              {item.label}
            </Text>
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
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/login')}>
          <Ionicons name="log-out-outline" size={20} color="#C45B83" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!isMobile && renderSidebar()}

      {isMobile && menuVisible && (
        <>
          <Pressable style={styles.mobileBackdrop} onPress={() => setMenuVisible(false)} />
          <View style={styles.mobileMenuWrapper}>{renderSidebar()}</View>
        </>
      )}

      <View style={styles.main}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={{paddingTop: 10}} /> 
          
          <View style={styles.header}>
            {isMobile && (
              <TouchableOpacity style={styles.mobileMenuButton} onPress={() => setMenuVisible(!menuVisible)}>
                <Ionicons name={menuVisible ? 'close' : 'menu'} size={25} color={DARK} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.pageTitle}>Tổng quan</Text>
              <Text style={styles.subtitle}>Wellcome to BeautyTech</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton} onPress={() => navigateTo('/admin/notifications')}>
                <Ionicons name="notifications-outline" size={21} color={DARK} />
                {pendingOrdersCount > 0 && <View style={styles.notificationDot} />}
              </TouchableOpacity>
              <View style={styles.topAvatar}>
                <Ionicons name="person" size={18} color={PINK} />
              </View>
            </View>
          </View>

          <View style={styles.welcomeCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeTitle}>Xin chào, Admin! 👋</Text>
              <Text style={styles.welcomeDescription}>
                Đây là tình hình hoạt động cửa hàng BeautyTech hôm nay.
              </Text>
              <Text style={styles.welcomeDate}>Hôm nay, {currentDate}</Text>
            </View>
            <Ionicons name="flower" size={isMobile ? 48 : 72} color="#FFFFFF" />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tổng quan hoạt động</Text>
            <Text style={styles.sectionHint}>Số liệu thực tế</Text>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={PINK} style={{ marginVertical: 30 }} />
          ) : (
            <View style={styles.statsGrid}>
              {dynamicStats.map((item) => (
                <View key={item.title} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon as IconName} size={22} color={item.color} />
                  </View>
                  <Text style={styles.statLabel}>{item.title}</Text>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={[styles.statChange, { color: item.color }]}>{item.change}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
          </View>

          <View style={styles.quickGrid}>
            <TouchableOpacity style={styles.quickCard} onPress={() => navigateTo('/admin/products')}>
              <View style={[styles.quickIcon, { backgroundColor: '#FCEAF0' }]}>
                <Ionicons name="add-circle-outline" size={25} color={PINK} />
              </View>
              <Text style={styles.quickTitle}>Thêm sản phẩm</Text>
              <Text style={styles.quickDescription}>Tạo sản phẩm mới</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickCard} onPress={() => navigateTo('/admin/orders')}>
              <View style={[styles.quickIcon, { backgroundColor: '#FFF4E5' }]}>
                <Ionicons name="clipboard-outline" size={25} color="#D99B4D" />
              </View>
              <Text style={styles.quickTitle}>Xử lý đơn hàng</Text>
              <Text style={styles.quickDescription}>{pendingOrdersCount} đơn đang chờ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickCard} onPress={() => navigateTo('/admin/vouchers')}>
              <View style={[styles.quickIcon, { backgroundColor: '#F0EEFF' }]}>
                <Ionicons name="ticket-outline" size={25} color="#8B83D8" />
              </View>
              <Text style={styles.quickTitle}>Tạo voucher</Text>
              <Text style={styles.quickDescription}>Ưu đãi cho khách hàng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickCard} onPress={() => navigateTo('/admin/notifications')}>
              <View style={[styles.quickIcon, { backgroundColor: '#EAF7F2' }]}>
                <Ionicons name="megaphone-outline" size={25} color="#65A994" />
              </View>
              <Text style={styles.quickTitle}>Gửi thông báo</Text>
              <Text style={styles.quickDescription}>Thông tin đến khách hàng</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
            <TouchableOpacity onPress={() => navigateTo('/admin/orders')}>
              <Text style={styles.viewAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.orderList}>
            {isLoading ? (
              <ActivityIndicator size="small" color={PINK} style={{ margin: 20 }} />
            ) : recentOrders.length === 0 ? (
              <Text style={{ textAlign: 'center', padding: 20, color: MUTED }}>Chưa có đơn hàng nào.</Text>
            ) : (
              recentOrders.map((order) => {
                const statusInfo = getOrderStatusInfo(order.orderStatus);
                const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN');

                return (
                  <View key={order._id} style={styles.orderRow}>
                    <View style={styles.orderIcon}>
                      <Ionicons name="receipt-outline" size={20} color={PINK} />
                    </View>

                    <View style={styles.orderInfo}>
                      <Text style={styles.orderId}>#{order.orderId}</Text>
                      <Text style={styles.orderCustomer}>{order.recipientName}</Text>
                      <Text style={styles.orderDate}>{orderDate}</Text>
                    </View>

                    <View style={styles.orderRight}>
                      <Text style={styles.orderTotal}>{formatMoney(order.total)}</Text>
                      <Text style={[styles.orderStatus, { color: statusInfo.color }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <Text style={styles.footer}>BeautyTech Admin · Your Personal Beauty Space</Text>
        </ScrollView>
      </View>
    </View>
  );
}

// GIỮ NGUYÊN TOÀN BỘ STYLES CỦA BẠN
const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: BG },
  sidebar: { width: 250, backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingTop: 30, paddingBottom: 15, borderRightWidth: 1, borderRightColor: '#F3E9ED' },
  mobileSidebar: { width: 250, height: '100%', elevation: 5 },
  mobileBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.18)', zIndex: 19 },
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notificationButton: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', position: 'relative', borderWidth: 1, borderColor: '#F3E9ED' },
  notificationDot: { position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: '#E56D83' },
  topAvatar: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#FCEAF0', alignItems: 'center', justifyContent: 'center' },
  welcomeCard: { backgroundColor: '#E99AB3', borderRadius: 20, padding: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 27 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  welcomeDescription: { color: '#FFFFFF', fontSize: 13, marginTop: 9, lineHeight: 20, maxWidth: 440 },
  welcomeDate: { color: '#FFF3F6', fontSize: 11, marginTop: 13, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: DARK },
  sectionHint: { fontSize: 11, color: MUTED },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 13, marginBottom: 25 },
  statCard: { flexGrow: 1, flexBasis: 180, backgroundColor: '#FFFFFF', borderRadius: 17, padding: 17, borderWidth: 1, borderColor: '#F4E9ED', minHeight: 155 },
  statIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  statLabel: { fontSize: 11, color: MUTED },
  statValue: { fontSize: 21, fontWeight: '800', color: DARK, marginTop: 6 },
  statChange: { fontSize: 10, marginTop: 6, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 13, marginBottom: 27 },
  quickCard: { flexGrow: 1, flexBasis: 180, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F4E9ED' },
  quickIcon: { width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  quickTitle: { fontSize: 13, fontWeight: '700', color: DARK },
  quickDescription: { fontSize: 10, color: MUTED, marginTop: 5 },
  viewAll: { fontSize: 12, color: PINK, fontWeight: '700' },
  orderList: { backgroundColor: '#FFFFFF', borderRadius: 17, borderWidth: 1, borderColor: '#F4E9ED', paddingHorizontal: 15 },
  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F6EFF2', gap: 11 },
  orderIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FCEAF0', alignItems: 'center', justifyContent: 'center' },
  orderInfo: { flex: 1, minWidth: 0 },
  orderId: { fontSize: 12, fontWeight: '800', color: DARK },
  orderCustomer: { fontSize: 11, color: MUTED, marginTop: 4 },
  orderDate: { fontSize: 10, color: '#B2A8AD', marginTop: 3 },
  orderRight: { alignItems: 'flex-end' },
  orderTotal: { fontSize: 12, fontWeight: '800', color: DARK },
  orderStatus: { fontSize: 10, fontWeight: '700', marginTop: 6 },
  footer: { textAlign: 'center', color: '#B5AAB0', fontSize: 10, marginTop: 25 },
});