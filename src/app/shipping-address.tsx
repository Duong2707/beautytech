import React, { useState, useEffect } from 'react';
// @ts-ignore
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal, TextInput, ActivityIndicator, Alert, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { router } from 'expo-router';
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
  const token = user?.token || "fake_token"; 

  const [addresses, setAddresses] = useState<Address[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', isDefault: false });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAddresses(token);
      setAddresses(data);
    } catch (error) {
      // Bỏ qua lỗi
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 👇 HÀM XỬ LÝ NÚT BACK AN TOÀN CHO CẢ WEB VÀ MOBILE
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/account'); // Quay về trang tài khoản nếu không có lịch sử
    }
  };

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
        await updateAddress(token, editingId, formData);
      } else {
        await createAddress(token, formData);
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
        await deleteAddress(token, id);
        loadData();
      } catch (error) {
        Alert.alert("Lỗi", "Không thể xóa địa chỉ");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
        performDelete();
      }
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#E91E63" style={{ marginTop: 50 }} />
        ) : addresses.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 50, color: '#666' }}>Chưa có địa chỉ nào.</Text>
        ) : (
          addresses.map((item: Address) => (
            <View key={item._id} style={styles.addressCard}>
              <View style={styles.cardHeader}>
                <View style={styles.namePhoneContainer}>
                  <Text style={styles.nameText}>{item.name}</Text>
                  <Text style={styles.phoneText}>| {item.phone}</Text>
                </View>
                {item.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Mặc định</Text>
                  </View>
                )}
              </View>

              <Text style={styles.addressText}>{item.address}</Text>
              
              <View style={styles.divider} />

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openForm(item)}>
                  <Ionicons name="pencil-outline" size={18} color="#E91E63" />
                  <Text style={styles.actionText}>Sửa</Text>
                </TouchableOpacity>
                {!item.isDefault && (
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item._id)}>
                    <Ionicons name="trash-outline" size={18} color="#E91E63" />
                    <Text style={styles.actionText}>Xóa</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => openForm()}>
          <Ionicons name="add" size={20} color="#E91E63" />
          <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</Text>
              
              <TextInput 
                style={styles.input} 
                placeholder="Họ và tên" 
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
              />
              <TextInput 
                style={styles.input} 
                placeholder="Số điện thoại" 
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
              />
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                placeholder="Địa chỉ chi tiết (Số nhà, đường, phường, quận...)" 
                multiline
                value={formData.address}
                onChangeText={(text) => setFormData({...formData, address: text})}
              />

              <Pressable style={styles.checkboxRow} onPress={toggleDefault}>
                <Ionicons 
                  name={formData.isDefault ? "checkbox" : "square-outline"} 
                  size={26} 
                  color={formData.isDefault ? "#E91E63" : "#888"} 
                />
                <Text style={{ marginLeft: 10, color: '#333', fontSize: 15 }}>
                  Đặt làm địa chỉ mặc định
                </Text>
              </Pressable>

              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#EEE' }]} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: '#333', fontWeight: 'bold' }}>Hủy bỏ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#E91E63' }]} onPress={handleSave}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backButton: { padding: 10, marginLeft: -10 }, // Tăng vùng bấm cho nút Back
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