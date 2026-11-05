import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal, Alert, useWindowDimensions, ActivityIndicator, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../data/datasources/remote/api';

type Voucher = {
  _id: string;
  code: string;
  description: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  quantity: number;
  used: number;
  expiry: string;
  active: boolean;
};

const PINK = '#E88BA8';
const DARK = '#30242A';
const MUTED = '#8E858A';
const BG = '#FFF8FA';

const menuItems = [
  { label: 'Tổng quan', icon: 'grid-outline', route: '/admin' },
  { label: 'Sản phẩm', icon: 'cube-outline', route: '/admin/products' },
  { label: 'Đơn hàng', icon: 'receipt-outline', route: '/admin/orders' },
//  { label: 'Shipper', icon: 'bicycle-outline', route: '/admin/shippers' },
  { label: 'Voucher', icon: 'ticket-outline', route: '/admin/vouchers' },
  { label: 'Thông báo', icon: 'notifications-outline', route: '/admin/notifications' },
];

const formatMoney = (value: number) => value.toLocaleString('vi-VN') + 'đ';

export default function AdminVouchersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [menuVisible, setMenuVisible] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [keyword, setKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiry, setExpiry] = useState('');

  // 🌟 GỌI API LẤY DANH SÁCH
  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/api/vouchers');
      setVouchers(res.data.data || res.data);
    } catch (error) {
      console.log('Lỗi tải voucher', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVouchers = vouchers.filter((voucher) => {
    const searchText = keyword.toLowerCase().trim();
    return (
      voucher.code.toLowerCase().includes(searchText) ||
      voucher.description.toLowerCase().includes(searchText)
    );
  });

  const activeCount = vouchers.filter((v) => v.active).length;
  const usedCount = vouchers.reduce((sum, v) => sum + (v.used || 0), 0);

  const resetForm = () => {
    setCode(''); setDescription(''); setType('percent'); setValue('');
    setMinOrder(''); setQuantity(''); setExpiry(''); setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (voucher: Voucher) => {
    setEditingId(voucher._id);
    setCode(voucher.code);
    setDescription(voucher.description);
    setType(voucher.type);
    setValue(String(voucher.value));
    setMinOrder(String(voucher.minOrder));
    setQuantity(String(voucher.quantity));
    setExpiry(voucher.expiry);
    setModalVisible(true);
  };

  // 🌟 LƯU VÀO DATABASE
  const saveVoucher = async () => {
    if (!code.trim() || !description.trim() || !value.trim() || !quantity.trim() || !expiry.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin voucher.');
      return;
    }

    const numericValue = Number(value);
    const numericMinOrder = Number(minOrder || 0);
    const numericQuantity = Number(quantity);

    const voucherData = {
      code: code.trim().toUpperCase(),
      description: description.trim(),
      type,
      value: numericValue,
      minOrder: numericMinOrder,
      quantity: numericQuantity,
      expiry: expiry.trim(),
      active: true,
    };

    try {
      if (editingId !== null) {
        await api.put(`/api/vouchers/${editingId}`, voucherData);
        Alert.alert('Thành công', 'Đã cập nhật voucher.');
      } else {
        await api.post('/api/vouchers', voucherData);
        Alert.alert('Thành công', 'Đã tạo voucher mới.');
      }
      setModalVisible(false);
      loadVouchers();
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể lưu voucher');
    }
  };

  // 🌟 BẬT/TẮT VOUCHER
  const toggleVoucher = async (voucher: Voucher) => {
    try {
      await api.put(`/api/vouchers/${voucher._id}`, { active: !voucher.active });
      loadVouchers();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái.');
    }
  };

  // 🌟 XÓA VOUCHER
  const deleteVoucher = (voucher: Voucher) => {
    Alert.alert('Xóa voucher', `Bạn có chắc muốn xóa mã ${voucher.code}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/vouchers/${voucher._id}`);
            loadVouchers();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa voucher');
          }
        },
      },
    ]);
  };

  const getDiscount = (voucher: Voucher) =>
    voucher.type === 'percent' ? `Giảm ${voucher.value}%` : `Giảm ${formatMoney(voucher.value)}`;

  const navigateTo = (route: string) => {
    setMenuVisible(false);
    router.push(route as any);
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
        const active = item.route === '/admin/vouchers';
        return (
          <TouchableOpacity key={item.label} style={[styles.menuItem, active && styles.menuActive]} onPress={() => navigateTo(item.route)}>
            <Ionicons name={item.icon as any} size={20} color={active ? PINK : MUTED} />
            <Text style={[styles.menuText, active && styles.menuTextActive]}>{item.label}</Text>
            {active && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
      <View style={styles.sidebarBottom}>
        <View style={styles.adminProfile}>
          <View style={styles.adminAvatar}><Ionicons name="person" size={19} color={PINK} /></View>
          <View style={{ flex: 1 }}><Text style={styles.adminName}>Administrator</Text><Text style={styles.adminRole}>Quản trị viên</Text></View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/login')}>
          <Ionicons name="log-out-outline" size={20} color="#C45B83" /><Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
                <Ionicons name={menuVisible ? 'close' : 'menu'} size={25} color={DARK} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.pageTitle}>Quản lý Voucher</Text>
              <Text style={styles.subtitle}>Tạo và quản lý Voucher</Text>
            </View>
            <TouchableOpacity style={[styles.addButton, isMobile && { paddingHorizontal: 12 }]} onPress={openAddModal}>
              <Ionicons name="add" size={isMobile ? 24 : 20} color="#FFFFFF" />
              {!isMobile && <Text style={styles.addButtonText}>Tạo voucher</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.stats}>
            <View style={styles.statCard}>
              <Ionicons name="ticket-outline" size={23} color={PINK} />
              <Text style={styles.statNumber}>{vouchers.length}</Text>
              <Text style={styles.statLabel}>Tổng voucher</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle-outline" size={23} color="#16A36A" />
              <Text style={styles.statNumber}>{activeCount}</Text>
              <Text style={styles.statLabel}>Đang hoạt động</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="gift-outline" size={23} color="#D69A35" />
              <Text style={styles.statNumber}>{usedCount}</Text>
              <Text style={styles.statLabel}>Lượt sử dụng</Text>
            </View>
          </View>

          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Danh sách mã giảm giá</Text>
            <View style={styles.searchWrapper}>
              <Ionicons name="search-outline" size={19} color="#AAAAAA" />
              <TextInput style={styles.searchInput} placeholder="Tìm kiếm mã voucher..." placeholderTextColor="#AAAAAA" value={keyword} onChangeText={setKeyword} />
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={PINK} style={{ marginVertical: 30 }} />
            ) : filteredVouchers.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="ticket-outline" size={40} color="#CCCCCC" />
                <Text style={styles.emptyText}>Không tìm thấy voucher</Text>
              </View>
            ) : (
              filteredVouchers.map((voucher) => (
                <View key={voucher._id} style={styles.voucherCard}>
                  <View style={styles.voucherTop}>
                    <View style={styles.ticketIcon}><Ionicons name="pricetag-outline" size={23} color={PINK} /></View>
                    <View style={styles.voucherIdentity}>
                      <Text style={styles.voucherCode}>{voucher.code}</Text>
                      <Text style={styles.voucherDescription}>{voucher.description}</Text>
                    </View>
                    <View style={[styles.statusBadge, voucher.active ? styles.activeBadge : styles.inactiveBadge]}>
                      <Text style={[styles.statusText, { color: voucher.active ? '#15803D' : '#B7791F' }]}>
                        {voucher.active ? 'Hoạt động' : 'Đã tắt'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.discountArea}>
                    <Text style={styles.discountText}>{getDiscount(voucher)}</Text>
                    <Text style={styles.minOrder}>Đơn tối thiểu: {formatMoney(voucher.minOrder)}</Text>
                  </View>

                  <View style={styles.details}>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>Số lượng</Text><Text style={styles.detailValue}>{voucher.quantity}</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>Đã sử dụng</Text><Text style={styles.detailValue}>{voucher.used}</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>Còn lại</Text><Text style={styles.detailValue}>{Math.max(0, voucher.quantity - voucher.used)}</Text></View>
                    <View style={styles.detailItem}><Text style={styles.detailLabel}>Hết hạn</Text><Text style={styles.detailValue}>{voucher.expiry}</Text></View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(voucher)}>
                      <Ionicons name="create-outline" size={16} color={PINK} /><Text style={styles.editText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toggleButton} onPress={() => toggleVoucher(voucher)}>
                      <Ionicons name={voucher.active ? 'eye-off-outline' : 'eye-outline'} size={16} color="#9A7130" />
                      <Text style={styles.toggleText}>{voucher.active ? 'Tắt' : 'Bật'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => deleteVoucher(voucher)}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" /><Text style={styles.deleteText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editingId !== null ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}</Text>
              <Text style={styles.modalSubtitle}>Điền thông tin chương trình giảm giá</Text>

              <Text style={styles.inputLabel}>Mã voucher</Text>
              <TextInput style={styles.input} placeholder="Ví dụ: BEAUTY20" autoCapitalize="characters" value={code} onChangeText={setCode} />

              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput style={styles.input} placeholder="Mô tả chương trình ưu đãi" value={description} onChangeText={setDescription} />

              <Text style={styles.inputLabel}>Loại giảm giá</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity style={[styles.typeButton, type === 'percent' && styles.typeActive]} onPress={() => setType('percent')}>
                  <Text style={[styles.typeText, type === 'percent' && styles.typeTextActive]}>Phần trăm (%)</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeButton, type === 'fixed' && styles.typeActive]} onPress={() => setType('fixed')}>
                  <Text style={[styles.typeText, type === 'fixed' && styles.typeTextActive]}>Số tiền (VNĐ)</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Giá trị giảm {type === 'percent' ? '(%)' : '(VNĐ)'}</Text>
              <TextInput style={styles.input} placeholder={type === 'percent' ? 'Ví dụ: 15' : 'Ví dụ: 50000'} keyboardType="numeric" value={value} onChangeText={setValue} />

              <Text style={styles.inputLabel}>Giá trị đơn hàng tối thiểu (VNĐ)</Text>
              <TextInput style={styles.input} placeholder="Ví dụ: 200000" keyboardType="numeric" value={minOrder} onChangeText={setMinOrder} />

              <Text style={styles.inputLabel}>Số lượng voucher</Text>
              <TextInput style={styles.input} placeholder="Ví dụ: 100" keyboardType="numeric" value={quantity} onChangeText={setQuantity} />

              <Text style={styles.inputLabel}>Ngày hết hạn (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} placeholder="2026-12-31" value={expiry} onChangeText={setExpiry} />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveVoucher}>
                  <Text style={styles.saveText}>Lưu voucher</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Bạn giữ nguyên toàn bộ phần `styles = StyleSheet.create({...})` cũ của bạn nhé
const styles = StyleSheet.create({
  // ... copy toàn bộ styles cũ vào đây ...
  container: { flex: 1, flexDirection: 'row', backgroundColor: BG },
  sidebar: { width: 250, backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingTop: 30, paddingBottom: 15, borderRightWidth: 1, borderRightColor: '#F3E9ED' },
  mobileSidebar: { width: 250, height: '100%', elevation: 5 },
    mobileBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 19, 
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
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: PINK, paddingVertical: 11, paddingHorizontal: 15, borderRadius: 10 },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, minWidth: 120, backgroundColor: '#FFFFFF', borderRadius: 15, padding: 17, borderWidth: 1, borderColor: '#F4E8ED' },
  statNumber: { fontSize: 25, fontWeight: '800', color: DARK, marginTop: 10 },
  statLabel: { color: MUTED, fontSize: 12, marginTop: 4 },
  contentCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 18, borderWidth: 1, borderColor: '#F4E8ED', marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: DARK, marginBottom: 16 },
  searchWrapper: { height: 45, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EEE3E8', borderRadius: 11, paddingHorizontal: 12, marginBottom: 17, backgroundColor: '#FFFCFD', gap: 8 },
  searchInput: { flex: 1, height: '100%', fontSize: 13, color: DARK },
  voucherCard: { borderWidth: 1, borderColor: '#F0E6EA', borderRadius: 14, padding: 16, marginBottom: 13 },
  voucherTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ticketIcon: { width: 43, height: 43, borderRadius: 12, backgroundColor: '#FCEEF2', alignItems: 'center', justifyContent: 'center' },
  voucherIdentity: { flex: 1, minWidth: 0 },
  voucherCode: { color: PINK, fontSize: 15, fontWeight: '800' },
  voucherDescription: { color: MUTED, fontSize: 11, marginTop: 4 },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 9, borderRadius: 20 },
  activeBadge: { backgroundColor: '#E5F7E9' },
  inactiveBadge: { backgroundColor: '#FFF4D9' },
  statusText: { fontSize: 10, fontWeight: '700' },
  discountArea: { backgroundColor: '#FFF5F8', padding: 13, borderRadius: 10, marginTop: 14 },
  discountText: { fontSize: 18, fontWeight: '800', color: PINK },
  minOrder: { color: MUTED, fontSize: 11, marginTop: 5 },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 15 },
  detailItem: { minWidth: 85, flex: 1 },
  detailLabel: { color: MUTED, fontSize: 10 },
  detailValue: { color: DARK, fontWeight: '700', fontSize: 12, marginTop: 5 },
  cardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, borderTopColor: '#F1E8EC', paddingTop: 13, marginTop: 15 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FCEEF2', padding: 9, borderRadius: 8 },
  editText: { color: '#C45B83', fontSize: 11, fontWeight: '700' },
  toggleButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF4D9', padding: 9, borderRadius: 8 },
  toggleText: { color: '#9A7130', fontSize: 11, fontWeight: '700' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEECEC', padding: 9, borderRadius: 8 },
  deleteText: { color: '#DC2626', fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', padding: 35 },
  emptyText: { color: MUTED, marginTop: 10, fontSize: 13 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  modalCard: { width: '100%', maxWidth: 460, maxHeight: '90%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 22 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: DARK },
  modalSubtitle: { color: MUTED, fontSize: 12, marginTop: 6, marginBottom: 18 },
  inputLabel: { fontSize: 12, color: '#51434A', fontWeight: '700', marginBottom: 6 },
  input: { height: 43, borderWidth: 1, borderColor: '#EEE3E8', borderRadius: 9, paddingHorizontal: 12, fontSize: 13, marginBottom: 13, color: DARK },
  typeRow: { flexDirection: 'row', gap: 9, marginBottom: 15 },
  typeButton: { flex: 1, padding: 11, borderRadius: 9, borderWidth: 1, borderColor: '#EEE3E8', alignItems: 'center' },
  typeActive: { backgroundColor: '#FCEEF2', borderColor: '#C45B83' },
  typeText: { color: '#777777', fontSize: 11, fontWeight: '600' },
  typeTextActive: { color: '#C45B83', fontWeight: '800' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 10, marginBottom: 5 },
  cancelButton: { paddingVertical: 11, paddingHorizontal: 17, borderRadius: 9, backgroundColor: '#F4F1F2' },
  cancelText: { color: '#777777', fontWeight: '700', fontSize: 12 },
  saveButton: { paddingVertical: 11, paddingHorizontal: 17, borderRadius: 9, backgroundColor: PINK },
  saveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});