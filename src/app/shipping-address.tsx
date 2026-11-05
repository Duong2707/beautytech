import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, ActivityIndicator, Alert, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../presentation/contexts/AuthContext'; 
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '../services/addressApi';

interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export default function ShippingAddressScreen() {
  const { user } = useAuth(); 
  const { selectMode } = useLocalSearchParams(); // Kiểm tra xem có phải đang ở chế độ chọn địa chỉ không

  const [addresses, setAddresses] = useState<Address[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', isDefault: false });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách địa chỉ");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const openForm = (item: Address | null = null) => {
    if (item) {
      setEditingId(item._id);
      setFormData({ name: item.name, phone: item.phone, address: item.address, isDefault: item.isDefault });
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', address: '', isDefault: false });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      if (editingId) {
        await updateAddress(editingId, formData);
      } else {
        await createAddress(formData);
      }
      setModalVisible(false);
      loadData(); 
    } catch (error: any) {
      console.error("Lỗi khi lưu:", error);
      Alert.alert("Lỗi", error.message || "Không thể lưu địa chỉ");
    }
  };

  const handleDelete = (id: string) => {
    const performDelete = async () => {
      try {
        await deleteAddress(id);
        loadData();
      } catch (error) {
        Alert.alert("Lỗi", "Không thể xóa địa chỉ");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) performDelete();
    } else {
      Alert.alert("Xác nhận", "Bạn có chắc muốn xóa địa chỉ này?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: performDelete }
      ]);
    }
  };

  const toggleDefault = () => {
    setFormData((prev) => ({ ...prev, isDefault: !prev.isDefault }));
  };

  // 👇 HÀM XỬ LÝ KHI BẤM CHỌN ĐỊA CHỈ (CHỈ DÙNG KHI CÓ SELECT_MODE)
  const handleSelectAddress = async (item: Address) => {
    try {
      // Cập nhật địa chỉ này thành mặc định
      await updateAddress(item._id, { ...item, isDefault: true });
      // Quay lại trang thanh toán
      router.back();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn địa chỉ này.");
    }
  };

  const dynamicStyles = getStyles();

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={{paddingTop: 30}} /> 
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/account')} style={dynamicStyles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Địa chỉ giao hàng</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#E91E63" style={{ marginTop: 50 }} />
        ) : addresses.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>Chưa có địa chỉ nào.</Text>
        ) : (
          addresses.map((item: Address) => (
            <Pressable 
              key={item._id} 
              style={dynamicStyles.addressCard}
              onPress={() => { if (selectMode) handleSelectAddress(item); }}
            >
              <View style={dynamicStyles.cardHeader}>
                <View style={dynamicStyles.namePhoneContainer}>
                  <Text style={dynamicStyles.nameText}>{item.name}</Text>
                  <Text style={dynamicStyles.phoneText}>| {item.phone}</Text>
                </View>
                {item.isDefault && (
                  <View style={dynamicStyles.defaultBadge}>
                    <Text style={dynamicStyles.defaultText}>Mặc định</Text>
                  </View>
                )}
              </View>

              <Text style={dynamicStyles.addressText}>{item.address}</Text>
              
              <View style={dynamicStyles.divider} />

              <View style={dynamicStyles.cardActions}>
                <TouchableOpacity style={dynamicStyles.actionButton} onPress={() => openForm(item)}>
                  <Ionicons name="pencil-outline" size={18} color="#E91E63" />
                  <Text style={dynamicStyles.actionText}>Sửa</Text>
                </TouchableOpacity>
                {!item.isDefault && (
                  <TouchableOpacity style={dynamicStyles.actionButton} onPress={() => handleDelete(item._id)}>
                    <Ionicons name="trash-outline" size={18} color="#E91E63" />
                    <Text style={dynamicStyles.actionText}>Xóa</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Pressable>
          ))
        )}

        <TouchableOpacity style={dynamicStyles.addButton} onPress={() => openForm()}>
          <Ionicons name="add" size={20} color="#E91E63" />
          <Text style={dynamicStyles.addButtonText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL THÊM / SỬA ĐỊA CHỈ */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.modalTitle}>{editingId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</Text>
              
              <TextInput style={dynamicStyles.input} placeholder="Họ và tên" value={formData.name} onChangeText={(text) => setFormData({...formData, name: text})} />
              <TextInput style={dynamicStyles.input} placeholder="Số điện thoại" keyboardType="phone-pad" value={formData.phone} onChangeText={(text) => setFormData({...formData, phone: text})} />
              <TextInput style={[dynamicStyles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Địa chỉ chi tiết..." multiline value={formData.address} onChangeText={(text) => setFormData({...formData, address: text})} />

              <Pressable style={dynamicStyles.checkboxRow} onPress={toggleDefault}>
                <Ionicons name={formData.isDefault ? "checkbox" : "square-outline"} size={26} color={formData.isDefault ? "#E91E63" : "#888"} />
                <Text style={{ marginLeft: 10, color: '#333', fontSize: 15 }}>Đặt làm địa chỉ mặc định</Text>
              </Pressable>

              <View style={dynamicStyles.modalActions}>
                <TouchableOpacity style={[dynamicStyles.modalBtn, { backgroundColor: '#EEE' }]} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: '#333', fontWeight: 'bold' }}>Hủy bỏ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[dynamicStyles.modalBtn, { backgroundColor: '#E91E63' }]} onPress={handleSave}>
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = () => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backButton: { padding: 10, marginLeft: -10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  addressCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  namePhoneContainer: { flexDirection: 'row', alignItems: 'center' },
  nameText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  phoneText: { fontSize: 14, color: '#666', marginLeft: 8 },
  defaultBadge: { backgroundColor: '#FCE4EC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  defaultText: { color: '#E91E63', fontSize: 12, fontWeight: 'bold' },
  addressText: { fontSize: 14, color: '#555', lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginLeft: 16 },
  actionText: { fontSize: 14, color: '#E91E63', marginLeft: 4 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E91E63', borderRadius: 12, paddingVertical: 14, marginTop: 8, borderStyle: 'dashed' },
  addButtonText: { color: '#E91E63', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 400, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingVertical: 5 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  modalBtn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
});