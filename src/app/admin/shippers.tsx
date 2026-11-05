
import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Shipper = {
  id: number;
  name: string;
  phone: string;
  email: string;
  area: string;
  active: boolean;
  orders: number;
};

const initialShippers: Shipper[] = [
  {
    id: 1,
    name: 'Nguyễn Văn Nam',
    phone: '0901234567',
    email: 'nam@gmail.com',
    area: 'Quận 1, TP. Hồ Chí Minh',
    active: true,
    orders: 12,
  },
  {
    id: 2,
    name: 'Trần Văn Bình',
    phone: '0912345678',
    email: 'binh@gmail.com',
    area: 'Quận 3, TP. Hồ Chí Minh',
    active: true,
    orders: 8,
  },
  {
    id: 3,
    name: 'Lê Minh Tuấn',
    phone: '0987654321',
    email: 'tuan@gmail.com',
    area: 'Thủ Đức, TP. Hồ Chí Minh',
    active: false,
    orders: 5,
  },
];

const PINK = '#E88BA8';
const DARK = '#30242A';
const MUTED = '#8E858A';
const BG = '#FFF8FA';

const menuItems = [
  { label: 'Tổng quan', icon: 'grid-outline', route: '/admin' },
  { label: 'Sản phẩm', icon: 'cube-outline', route: '/admin/products' },
  { label: 'Đơn hàng', icon: 'receipt-outline', route: '/admin/orders' },
  { label: 'Shipper', icon: 'bicycle-outline', route: '/admin/shippers' },
  { label: 'Voucher', icon: 'ticket-outline', route: '/admin/vouchers' },
  {
    label: 'Thông báo',
    icon: 'notifications-outline',
    route: '/admin/notifications',
  },
];

export default function AdminShippersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const [menuVisible, setMenuVisible] = useState(false);
  const [shippers, setShippers] = useState<Shipper[]>(initialShippers);
  const [keyword, setKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');

  const activeCount = shippers.filter((s) => s.active).length;
  const inactiveCount = shippers.length - activeCount;

  const filteredShippers = shippers.filter((shipper) => {
    const text = keyword.toLowerCase().trim();

    return (
      shipper.name.toLowerCase().includes(text) ||
      shipper.phone.includes(keyword.trim()) ||
      shipper.email.toLowerCase().includes(text)
    );
  });

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setEmail('');
    setArea('');
    setModalVisible(true);
  };

  const openEditModal = (shipper: Shipper) => {
    setEditingId(shipper.id);
    setName(shipper.name);
    setPhone(shipper.phone);
    setEmail(shipper.email);
    setArea(shipper.area);
    setModalVisible(true);
  };

  const saveShipper = () => {
    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !area.trim()
    ) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập đầy đủ thông tin shipper.',
      );
      return;
    }

    if (!/^[0-9]{9,11}$/.test(phone.trim())) {
      Alert.alert(
        'Số điện thoại không hợp lệ',
        'Vui lòng kiểm tra lại số điện thoại.',
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(
        'Email không hợp lệ',
        'Vui lòng nhập đúng định dạng email.',
      );
      return;
    }

    if (editingId !== null) {
      setShippers((current) =>
        current.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim(),
                area: area.trim(),
              }
            : s,
        ),
      );

      Alert.alert('Thành công', 'Đã cập nhật thông tin shipper.');
    } else {
      const newShipper: Shipper = {
        id: Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        area: area.trim(),
        active: true,
        orders: 0,
      };

      setShippers((current) => [newShipper, ...current]);

      Alert.alert('Thành công', 'Đã thêm shipper mới.');
    }

    setModalVisible(false);
  };

  const toggleStatus = (shipper: Shipper) => {
    const action = shipper.active ? 'khóa' : 'mở hoạt động';

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc muốn ${action} shipper ${shipper.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            setShippers((current) =>
              current.map((s) =>
                s.id === shipper.id
                  ? { ...s, active: !s.active }
                  : s,
              ),
            );
          },
        },
      ],
    );
  };

  const deleteShipper = (shipper: Shipper) => {
    Alert.alert(
      'Xóa shipper',
      `Bạn có chắc muốn xóa ${shipper.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setShippers((current) =>
              current.filter((s) => s.id !== shipper.id),
            );
          },
        },
      ],
    );
  };

  const navigateTo = (route: string) => {
    setMenuVisible(false);
    router.push(route as any);
  };

  const renderSidebar = () => (
    <View style={[styles.sidebar, isMobile && styles.mobileSidebar]}>
      <View style={styles.logoArea}>
        <View style={styles.logoRow}>
          <Ionicons name="flower-outline" size={27} color={PINK} />
          <Text style={styles.logo}>BeautyTech.</Text>
        </View>
        <Text style={styles.logoSub}>ADMIN PANEL</Text>
      </View>

      <Text style={styles.menuHeading}>MENU CHÍNH</Text>

      {menuItems.map((item) => {
        const active = item.route === '/admin/shippers';

        return (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuItem,
              active && styles.menuActive,
            ]}
            onPress={() => navigateTo(item.route)}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={active ? PINK : MUTED}
            />

            <Text
              style={[
                styles.menuText,
                active && styles.menuTextActive,
              ]}
            >
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

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace('/login')}
        >
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
        <View style={styles.mobileMenuWrapper}>
          {renderSidebar()}
        </View>
      )}

      <View style={styles.main}>
        {isMobile && (
          <TouchableOpacity
            style={styles.mobileMenuButton}
            onPress={() => setMenuVisible(!menuVisible)}
          >
            <Ionicons
              name={menuVisible ? 'close' : 'menu'}
              size={25}
              color={DARK}
            />
          </TouchableOpacity>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.pageTitle}>Quản lý Shipper</Text>
              <Text style={styles.subtitle}>
                Quản lý nhân viên giao hàng của BeautyTech
              </Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={openAddModal}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Thêm shipper</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stats}>
            <View style={styles.statCard}>
              <Ionicons name="people-outline" size={23} color={PINK} />
              <Text style={styles.statNumber}>{shippers.length}</Text>
              <Text style={styles.statLabel}>Tổng shipper</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons
                name="checkmark-circle-outline"
                size={23}
                color="#16A36A"
              />
              <Text style={styles.statNumber}>{activeCount}</Text>
              <Text style={styles.statLabel}>Đang hoạt động</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons
                name="pause-circle-outline"
                size={23}
                color="#D69A35"
              />
              <Text style={styles.statNumber}>{inactiveCount}</Text>
              <Text style={styles.statLabel}>Đã khóa</Text>
            </View>
          </View>

          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>
              Danh sách nhân viên giao hàng
            </Text>

            <View style={styles.searchWrapper}>
              <Ionicons
                name="search-outline"
                size={19}
                color="#AAAAAA"
              />

              <TextInput
                style={styles.searchInput}
                placeholder="Tìm theo tên, số điện thoại hoặc email..."
                placeholderTextColor="#AAAAAA"
                value={keyword}
                onChangeText={setKeyword}
              />
            </View>

            {filteredShippers.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="people-outline"
                  size={40}
                  color="#CCCCCC"
                />
                <Text style={styles.emptyText}>
                  Không tìm thấy shipper
                </Text>
              </View>
            ) : (
              filteredShippers.map((shipper) => (
                <View key={shipper.id} style={styles.shipperCard}>
                  <View style={styles.shipperHeader}>
                    <View style={styles.avatar}>
                      <Ionicons
                        name="person"
                        size={25}
                        color={PINK}
                      />
                    </View>

                    <View style={styles.shipperIdentity}>
                      <Text style={styles.shipperName}>
                        {shipper.name}
                      </Text>
                      <Text style={styles.shipperId}>
                        Mã shipper: SP{shipper.id}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        shipper.active
                          ? styles.activeBadge
                          : styles.inactiveBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: shipper.active
                              ? '#15803D'
                              : '#B7791F',
                          },
                        ]}
                      >
                        {shipper.active ? 'Hoạt động' : 'Đã khóa'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoList}>
                    <View style={styles.infoRow}>
                      <Ionicons
                        name="call-outline"
                        size={16}
                        color="#999999"
                      />
                      <Text style={styles.infoText}>
                        {shipper.phone}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="mail-outline"
                        size={16}
                        color="#999999"
                      />
                      <Text style={styles.infoText}>
                        {shipper.email}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color="#999999"
                      />
                      <Text style={styles.infoText}>
                        {shipper.area}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="bicycle-outline"
                        size={16}
                        color="#999999"
                      />
                      <Text style={styles.infoText}>
                        {shipper.orders} đơn được phân công (dữ liệu mẫu)
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditModal(shipper)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color={PINK}
                      />
                      <Text style={styles.editText}>Chỉnh sửa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.lockButton}
                      onPress={() => toggleStatus(shipper)}
                    >
                      <Ionicons
                        name={
                          shipper.active
                            ? 'lock-closed-outline'
                            : 'lock-open-outline'
                        }
                        size={16}
                        color="#9A7130"
                      />
                      <Text style={styles.lockText}>
                        {shipper.active ? 'Khóa' : 'Mở khóa'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteShipper(shipper)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#DC2626"
                      />
                      <Text style={styles.deleteText}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>
                {editingId !== null
                  ? 'Chỉnh sửa shipper'
                  : 'Thêm shipper mới'}
              </Text>

              <Text style={styles.modalSubtitle}>
                Nhập thông tin nhân viên giao hàng
              </Text>

              <Text style={styles.inputLabel}>Họ và tên</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.inputLabel}>Khu vực giao hàng</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
                value={area}
                onChangeText={setArea}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveShipper}
                >
                  <Text style={styles.saveText}>Lưu thông tin</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: BG,
  },

  sidebar: {
    width: 250,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 15,
    borderRightWidth: 1,
    borderRightColor: '#F3E9ED',
  },

  mobileSidebar: {
    width: 250,
    height: '100%',
    elevation: 5,
  },

  mobileMenuWrapper: {
    position: 'absolute',
    zIndex: 20,
    top: 0,
    bottom: 0,
    left: 0,
  },

  logoArea: {
    marginBottom: 35,
    paddingHorizontal: 7,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: PINK,
  },

  logoSub: {
    fontSize: 10,
    color: MUTED,
    letterSpacing: 2,
    marginTop: 5,
    marginLeft: 35,
  },

  menuHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B0A5AA',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 10,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 11,
    marginBottom: 6,
    gap: 11,
  },

  menuActive: {
    backgroundColor: '#FCEEF2',
  },

  menuText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: '500',
    flex: 1,
  },

  menuTextActive: {
    color: PINK,
    fontWeight: '700',
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PINK,
  },

  sidebarBottom: {
    marginTop: 'auto',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3E9ED',
  },

  adminProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 5,
    marginBottom: 12,
  },

  adminAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FCEEF2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  adminName: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK,
  },

  adminRole: {
    fontSize: 10,
    color: MUTED,
    marginTop: 3,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 10,
  },

  logoutText: {
    fontSize: 13,
    color: '#C45B83',
    fontWeight: '600',
  },

  main: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 25,
    paddingTop: 28,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  mobileMenuButton: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F3E9ED',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 25,
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: DARK,
  },

  subtitle: {
    color: MUTED,
    fontSize: 13,
    marginTop: 6,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: PINK,
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 10,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 17,
    borderWidth: 1,
    borderColor: '#F4E8ED',
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: DARK,
    marginTop: 10,
  },

  statLabel: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },

  contentCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F4E8ED',
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
    marginBottom: 16,
  },

  searchWrapper: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE3E8',
    borderRadius: 11,
    paddingHorizontal: 12,
    marginBottom: 17,
    backgroundColor: '#FFFCFD',
    gap: 8,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: DARK,
    outlineStyle: 'none' as any,
  },

  shipperCard: {
    borderWidth: 1,
    borderColor: '#F0E6EA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 13,
  },

  shipperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FCEEF2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  shipperIdentity: {
    flex: 1,
    minWidth: 0,
  },

  shipperName: {
    fontSize: 14,
    fontWeight: '800',
    color: DARK,
  },

  shipperId: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
  },

  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 20,
  },

  activeBadge: {
    backgroundColor: '#E5F7E9',
  },

  inactiveBadge: {
    backgroundColor: '#FFF4D9',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  infoList: {
    marginTop: 15,
    gap: 9,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  infoText: {
    color: '#666666',
    fontSize: 12,
    flex: 1,
  },

  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1E8EC',
    paddingTop: 13,
    marginTop: 15,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FCEEF2',
    padding: 9,
    borderRadius: 8,
  },

  editText: {
    color: '#C45B83',
    fontSize: 11,
    fontWeight: '700',
  },

  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF4D9',
    padding: 9,
    borderRadius: 8,
  },

  lockText: {
    color: '#9A7130',
    fontSize: 11,
    fontWeight: '700',
  },

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEECEC',
    padding: 9,
    borderRadius: 8,
  },

  deleteText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },

  empty: {
    alignItems: 'center',
    padding: 35,
  },

  emptyText: {
    color: MUTED,
    marginTop: 10,
    fontSize: 13,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },

  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    maxHeight: '90%',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DARK,
  },

  modalSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 6,
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 12,
    color: '#51434A',
    fontWeight: '700',
    marginBottom: 6,
  },

  input: {
    height: 43,
    borderWidth: 1,
    borderColor: '#EEE3E8',
    borderRadius: 9,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 13,
    color: DARK,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 9,
    marginTop: 8,
  },

  cancelButton: {
    paddingVertical: 11,
    paddingHorizontal: 17,
    borderRadius: 9,
    backgroundColor: '#F4F1F2',
  },

  cancelText: {
    color: '#777777',
    fontWeight: '700',
    fontSize: 12,
  },

  saveButton: {
    paddingVertical: 11,
    paddingHorizontal: 17,
    borderRadius: 9,
    backgroundColor: PINK,
  },

  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
