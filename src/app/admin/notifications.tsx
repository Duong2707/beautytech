import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// 🌟 Import api
import api from '../../data/datasources/remote/api';

// Cập nhật Type cho khớp với Database
type Notification = {
  _id: string;
  title: string;
  content: string;
  type: 'system' | 'promo';
  voucherCode?: string;
  createdAt: string;
};

const menuItems = [
  { label: 'Tổng quan', icon: 'grid-outline', route: '/admin' },
  { label: 'Sản phẩm', icon: 'cube-outline', route: '/admin/products' },
  { label: 'Đơn hàng', icon: 'receipt-outline', route: '/admin/orders' },
//  { label: 'Shipper', icon: 'bicycle-outline', route: '/admin/shippers' },
  { label: 'Voucher', icon: 'ticket-outline', route: '/admin/vouchers' },
  { label: 'Thông báo', icon: 'notifications-outline', route: '/admin/notifications' },
];

export default function AdminNotificationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // State cho Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'system' | 'promo'>('system');
  const [voucherCode, setVoucherCode] = useState('');

  // 🌟 GỌI API LẤY DANH SÁCH THÔNG BÁO
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/notifications/admin');
      setNotifications(res.data.data || res.data);
    } catch (error) {
      console.log('Lỗi tải thông báo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 TẠO THÔNG BÁO MỚI
  const saveNotification = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề và nội dung thông báo.');
      return;
    }
    
    if (type === 'promo' && !voucherCode.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mã giảm giá cho thông báo khuyến mãi.');
      return;
    }

    try {
      await api.post('/api/notifications', {
        title: title.trim(),
        content: content.trim(),
        type,
        voucherCode: type === 'promo' ? voucherCode.trim().toUpperCase() : undefined,
      });
      Alert.alert('Thành công', 'Đã tạo thông báo mới.');
      setModalVisible(false);
      resetForm();
      loadNotifications(); // Load lại danh sách
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo thông báo.');
    }
  };

  // 🌟 XÓA THÔNG BÁO
  const deleteNotification = (id: string) => {
    Alert.alert('Xóa thông báo', 'Bạn có chắc muốn xóa thông báo này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/notifications/${id}`);
            loadNotifications();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa thông báo.');
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('system');
    setVoucherCode('');
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
        const active = item.route === '/admin/notifications';
        return (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, active && styles.menuActive]}
            onPress={() => {
              setShowMenu(false);
              router.push(item.route as any);
            }}
          >
            <Ionicons name={item.icon as any} size={20} color={active ? PINK : MUTED} />
            <Text style={[styles.menuText, active && styles.menuTextActive]}>{item.label}</Text>
            {active && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}

      <View style={styles.sidebarBottom}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color={PINK} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Administrator</Text>
            <Text style={styles.profileRole}>Quản trị viên</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/login')}>
          <Ionicons name="log-out-outline" size={20} color={PINK} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {!isMobile && renderSidebar()}

      {isMobile && showMenu && (
        <View style={styles.mobileOverlay}>
          <TouchableOpacity style={styles.overlayBackground} activeOpacity={1} onPress={() => setShowMenu(false)} />
          <View style={styles.mobileSidebar}>{renderSidebar()}</View>
        </View>
      )}

      <View style={styles.main}>
        <View style={{paddingTop: 15}} /> 
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {isMobile && (
                <TouchableOpacity style={styles.menuToggle} onPress={() => setShowMenu(true)}>
                  <Ionicons name="menu-outline" size={25} color={DARK} />
                </TouchableOpacity>
              )}
              <View style={styles.headerText}>
                <Text style={styles.pageTitle}>Quản lý thông báo</Text>
                <Text style={styles.subtitle}>Tạo thông báo gửi đến khách hàng</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.addButton, isMobile && { paddingHorizontal: 12 }]} onPress={() => setModalVisible(true)}>
              <Ionicons name="add" size={isMobile ? 24 : 20} color="#FFFFFF" />
              {!isMobile && <Text style={styles.addButtonText}>Tạo thông báo</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Danh sách thông báo</Text>
              <View style={styles.totalBadge}>
                <Text style={styles.totalBadgeText}>{notifications.length} thông báo</Text>
              </View>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={PINK} style={{ marginTop: 30, marginBottom: 30 }} />
            ) : notifications.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={35} color="#C9BFC4" />
                <Text style={styles.emptyText}>Chưa có thông báo nào.</Text>
              </View>
            ) : (
              notifications.map((item) => (
                <View key={item._id} style={styles.notificationCard}>
                  <View style={styles.notificationTop}>
                    <View style={[styles.notificationIcon, { backgroundColor: item.type === 'promo' ? '#FFF5F8' : '#F0F8FF' }]}>
                      <Ionicons name={item.type === 'promo' ? 'gift' : 'notifications'} size={21} color={item.type === 'promo' ? PINK : '#4A90E2'} />
                    </View>
                    <View style={styles.notificationIdentity}>
                      <Text style={styles.notificationTitle}>{item.title}</Text>
                      <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteNotification(item._id)} style={{ padding: 5 }}>
                      <Ionicons name="trash-outline" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.notificationContent}>{item.content}</Text>

                  <View style={styles.audienceBadge}>
                    <Ionicons name="people-outline" size={14} color={PINK} />
                    <Text style={styles.audienceText}>Gửi: Tất cả khách hàng</Text>
                  </View>

                  {item.voucherCode && (
                    <View style={[styles.audienceBadge, { backgroundColor: '#E8F5E9', marginTop: 8 }]}>
                      <Ionicons name="ticket-outline" size={14} color="#4CAF50" />
                      <Text style={[styles.audienceText, { color: '#4CAF50' }]}>Mã giảm giá: {item.voucherCode}</Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* MODAL TẠO MỚI */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <View style={styles.modalIcon}>
                  <Ionicons name="notifications-outline" size={23} color={PINK} />
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={22} color={MUTED} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>Tạo thông báo mới</Text>
              <Text style={styles.modalSubtitle}>Nhập nội dung bạn muốn gửi đến khách hàng.</Text>

              <Text style={styles.inputLabel}>Tiêu đề thông báo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Ưu đãi đặc biệt hôm nay"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>Nội dung thông báo</Text>
              <TextInput
                style={[styles.input, { height: 100, paddingTop: 12 }]}
                placeholder="Nhập nội dung..."
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.inputLabel}>Loại thông báo</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                <TouchableOpacity 
                  style={[styles.input, { flex: 1, alignItems: 'center', backgroundColor: type === 'system' ? '#FCEEF2' : '#FFFCFD', borderColor: type === 'system' ? PINK : '#EEE3E8' }]} 
                  onPress={() => setType('system')}
                >
                  <Text style={{ color: type === 'system' ? PINK : DARK, fontWeight: '700' }}>Hệ thống</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.input, { flex: 1, alignItems: 'center', backgroundColor: type === 'promo' ? '#FCEEF2' : '#FFFCFD', borderColor: type === 'promo' ? PINK : '#EEE3E8' }]} 
                  onPress={() => setType('promo')}
                >
                  <Text style={{ color: type === 'promo' ? PINK : DARK, fontWeight: '700' }}>Khuyến mãi</Text>
                </TouchableOpacity>
              </View>

              {type === 'promo' && (
                <>
                  <Text style={styles.inputLabel}>Mã Voucher (Bắt buộc)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ví dụ: BEAUTY20"
                    value={voucherCode}
                    onChangeText={setVoucherCode}
                    autoCapitalize="characters"
                  />
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveNotification}>
                  <Ionicons name="checkmark" size={17} color="#FFFFFF" />
                  <Text style={styles.saveText}>Gửi thông báo</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const PINK = '#E88BA8';
const DARK = '#30242A';
const MUTED = '#8E858A';
const BG = '#FFF8FA';

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: BG },
  sidebar: { width: 250, backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingTop: 30, paddingBottom: 15, borderRightWidth: 1, borderRightColor: '#F3E9ED' },
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
  profile: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 5, marginBottom: 15 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FCEEF2', alignItems: 'center', justifyContent: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 12, fontWeight: '700', color: DARK },
  profileRole: { fontSize: 10, color: MUTED, marginTop: 3 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 12, paddingVertical: 12 },
  logoutText: { fontSize: 13, fontWeight: '600', color: PINK },
  
  mobileOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, flexDirection: 'row' },
  overlayBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(35, 25, 30, 0.35)' },
  mobileSidebar: { width: 250, height: '100%', zIndex: 2 },
  
  main: { flex: 1, paddingHorizontal: 25, paddingTop: 28 },
  scrollContent: { paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  headerText: { flex: 1 },
  menuToggle: { width: 42, height: 42, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F4E8ED', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 25, fontWeight: '800', color: DARK },
  subtitle: { color: MUTED, fontSize: 13, marginTop: 6 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: PINK, paddingVertical: 11, paddingHorizontal: 15, borderRadius: 10 },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  
  contentCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 18, borderWidth: 1, borderColor: '#F4E8ED', marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: DARK },
  totalBadge: { backgroundColor: '#FCEEF2', paddingVertical: 7, paddingHorizontal: 11, borderRadius: 20 },
  totalBadgeText: { color: PINK, fontSize: 11, fontWeight: '700' },
  
  notificationCard: { borderWidth: 1, borderColor: '#F0E6EA', borderRadius: 14, padding: 16, marginBottom: 13, backgroundColor: '#FFFFFF' },
  notificationTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notificationIcon: { width: 43, height: 43, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notificationIdentity: { flex: 1 },
  notificationTitle: { color: DARK, fontSize: 14, fontWeight: '800' },
  dateText: { color: MUTED, fontSize: 11, marginTop: 4 },
  notificationContent: { color: '#6F656A', fontSize: 12, lineHeight: 20, marginTop: 14 },
  audienceBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, backgroundColor: '#FFF5F8', paddingVertical: 7, paddingHorizontal: 10, borderRadius: 8, marginTop: 12 },
  audienceText: { color: PINK, fontSize: 11, fontWeight: '600' },
  
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: MUTED, marginTop: 10, fontSize: 13 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(35, 25, 30, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  modalCard: { width: '100%', maxWidth: 460, maxHeight: '90%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 },
  modalIcon: { width: 43, height: 43, borderRadius: 12, backgroundColor: '#FCEEF2', alignItems: 'center', justifyContent: 'center' },
  closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F7F4F5', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: DARK },
  modalSubtitle: { color: MUTED, fontSize: 12, marginTop: 6, marginBottom: 20 },
  inputLabel: { fontSize: 12, color: '#51434A', fontWeight: '700', marginBottom: 7 },
  input: { minHeight: 43, borderWidth: 1, borderColor: '#EEE3E8', borderRadius: 9, paddingHorizontal: 12, fontSize: 13, marginBottom: 15, color: DARK, backgroundColor: '#FFFCFD', justifyContent: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 9, marginTop: 20, marginBottom: 5 },
  cancelButton: { paddingVertical: 11, paddingHorizontal: 17, borderRadius: 9, backgroundColor: '#F4F1F2' },
  cancelText: { color: '#777777', fontWeight: '700', fontSize: 12 },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 11, paddingHorizontal: 17, borderRadius: 9, backgroundColor: PINK },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});