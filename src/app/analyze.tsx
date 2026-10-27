import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert, ActivityIndicator, ScrollView, Modal, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Thêm lại AsyncStorage
import { useCart } from '../presentation/contexts/CartContext'; 
import { useTheme } from '../presentation/contexts/ThemeContext';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80";

const mockProducts = [
  { _id: '1', name: 'Glow Serum', detail: 'Serum dưỡng sáng da', price: '259.000đ', priceValue: 259000, image: FALLBACK_IMAGE, target: ['Da không đều màu', 'Da xỉn màu', 'Da dầu'], usage: 'Thoa 2-3 giọt lên da sạch vào buổi sáng và tối. Vỗ nhẹ để thẩm thấu.' },
  { _id: '2', name: 'Hydra Cream', detail: 'Kem dưỡng ẩm sâu', price: '320.000đ', priceValue: 320000, image: FALLBACK_IMAGE, target: ['Da khô', 'Thiếu ẩm / Bong tróc', 'Da thường'], usage: 'Lấy một lượng vừa đủ thoa đều lên mặt sau bước dùng serum.' },
  { _id: '3', name: 'Pure Cleanser', detail: 'Sữa rửa mặt dịu nhẹ', price: '189.000đ', priceValue: 189000, image: FALLBACK_IMAGE, target: ['Da dầu', 'Lỗ chân lông to', 'Da nhạy cảm', 'Dị ứng / Kích ứng'], usage: 'Lấy một lượng nhỏ tạo bọt, massage nhẹ nhàng trên mặt ướt, sau đó rửa sạch.' },
  { _id: '4', name: 'La Roche-Posay', detail: 'Sữa rửa mặt cho da mụn', price: '550.000đ', priceValue: 550000, image: FALLBACK_IMAGE, target: ['Da dầu', 'Lỗ chân lông to', 'Mụn ẩn'], usage: 'Dùng 2 lần/ngày, tạo bọt và rửa sạch.' }, 
];

export default function AnalyzeScreen() {
  const router = useRouter();
  const { addToCart } = useCart(); 
  const { theme } = useTheme();
  
  const { surveySkinType, surveyConcerns, surveyAge, surveyRoutine, surveyBudget } = useLocalSearchParams<{ 
    surveySkinType?: string, surveyConcerns?: string, surveyAge?: string, surveyRoutine?: string, surveyBudget?: string 
  }>();
  
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  const [usageModalVisible, setUsageModalVisible] = useState(false);
  const [currentUsage, setCurrentUsage] = useState('');
  const [cartModalVisible, setCartModalVisible] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) { Alert.alert('Quyền truy cập', 'Bạn cần cấp quyền truy cập thư viện ảnh.'); return; }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, aspect: [1, 1], quality: 0.8 
    });
    if (!pickerResult.canceled) { setImage(pickerResult.assets[0].uri); setResult(null); setIsSaved(false); }
  };

  const handleAnalyze = async () => {
    if (!image) { Alert.alert('Lỗi', 'Vui lòng chọn hoặc chụp ảnh'); return; }
    setLoading(true);
    
    // Chế độ giả lập (Mock Data)
    setTimeout(() => {
      const isAcne = Math.random() > 0.5;
      setResult({ success: true, data: { skinCondition: isAcne ? 'Acne' : 'Normal', confidence: isAcne ? 0.9563 : 0.8912 } });
      setIsSaved(false);
      setLoading(false);
    }, 1500);
  };

  const getRecommendedProducts = () => {
    if (!result) return [];
    const skinCondition = result.data?.skinCondition; 
    const concernsList = surveyConcerns ? surveyConcerns.split(',') : [];
    return mockProducts.filter(prod => {
      let matchSkin = false;
      if (skinCondition === 'Acne' && prod.target.includes('Lỗ chân lông to')) matchSkin = true;
      if (prod.target.some(t => concernsList.includes(t) || prod.target.includes(surveySkinType || ''))) matchSkin = true;
      if (!matchSkin) return false;
      if (!surveyBudget || surveyBudget === 'Không quan trọng') return true;
      if (surveyBudget === 'Dưới 200k') return prod.priceValue < 200000;
      if (surveyBudget === '200k - 500k') return prod.priceValue >= 200000 && prod.priceValue <= 500000;
      if (surveyBudget === 'Trên 500k') return prod.priceValue > 500000;
      return true;
    }).slice(0, 3); 
  };

  const recommendedProducts = getRecommendedProducts();

  const handleShowUsage = (usage: string) => {
    setCurrentUsage(usage);
    setUsageModalVisible(true);
  };

  const handleAddToCart = async (product: any) => {
    await addToCart(product, 1, 'Mặc định'); 
    setCartModalVisible(true);
  };

  // ĐÃ SỬA: Quay lại dùng AsyncStorage
  const saveToDiary = async () => {
    if (isSaved) return; 
    try {
      const newEntry = {
        id: Date.now().toString(), 
        date: new Date().toISOString(), 
        skinCondition: result.data.skinCondition, 
        confidence: result.data.confidence,
        survey: { type: surveySkinType, concerns: surveyConcerns, age: surveyAge, routine: surveyRoutine, budget: surveyBudget }
      };
      const existingData = await AsyncStorage.getItem('@skin_diary');
      const history = existingData ? JSON.parse(existingData) : [];
      history.unshift(newEntry); 
      await AsyncStorage.setItem('@skin_diary', JSON.stringify(history));
      setIsSaved(true);
      
      if (Platform.OS === 'web') {
        window.alert("Đã lưu kết quả vào Nhật ký da!");
      } else {
        Alert.alert("Thành công", "Đã lưu kết quả vào Nhật ký da!");
      }
    } catch (error) { 
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu.'); 
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      <View style={dynamicStyles.header}>
        <Pressable style={dynamicStyles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/home")}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle}>Phân tích da AI</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Tải ảnh lên để phân tích</Text>
        <Text style={dynamicStyles.subtitle}>Chụp rõ khuôn mặt, không đeo kính, ánh sáng tốt.</Text>

        <Pressable style={dynamicStyles.imagePicker} onPress={pickImage}>
          {image ? <Image source={{ uri: image }} style={dynamicStyles.image} /> : (
            <View style={dynamicStyles.placeholder}><Ionicons name="camera-outline" size={50} color={theme.primary} /><Text style={dynamicStyles.placeholderText}>Bấm để chọn ảnh</Text></View>
          )}
        </Pressable>

        <Pressable style={[dynamicStyles.analyzeButton, (!image || loading) && { opacity: 0.5 }]} onPress={handleAnalyze} disabled={!image || loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : (<><Ionicons name="scan-outline" size={20} color="#FFFFFF" /><Text style={dynamicStyles.analyzeButtonText}>Bắt đầu phân tích</Text></>)}
        </Pressable>

        {result && result.data && (
          <View style={dynamicStyles.resultContainer}>
            <View style={dynamicStyles.resultHeader}><Ionicons name="checkmark-circle" size={24} color={theme.primary} /><Text style={dynamicStyles.resultTitle}>Kết quả phân tích</Text></View>
            
            <View style={dynamicStyles.conditionBox}>
              <Text style={dynamicStyles.conditionLabel}>Tình trạng da (Từ AI):</Text>
              <Text style={dynamicStyles.conditionValue}>{result.data.skinCondition === 'Acne' ? 'Da mụn (Acne)' : 'Da thường (Normal)'}</Text>
              <Text style={dynamicStyles.confidenceText}>Độ chính xác: {Math.round((result.data.confidence || 0) * 100)}%</Text>
            </View>

            <View style={dynamicStyles.surveyBox}>
              <Text style={dynamicStyles.surveyTitle}>Thông tin khảo sát của bạn:</Text>
              <View style={dynamicStyles.surveyRow}><Text style={dynamicStyles.surveyLabel}>Loại da:</Text><Text style={dynamicStyles.surveyValue}>{surveySkinType || 'Chưa rõ'}</Text></View>
              <View style={dynamicStyles.surveyRow}><Text style={dynamicStyles.surveyLabel}>Vấn đề:</Text><Text style={dynamicStyles.surveyValue}>{surveyConcerns ? surveyConcerns.split(',').join(', ') : 'Chưa rõ'}</Text></View>
              <View style={dynamicStyles.surveyRow}><Text style={dynamicStyles.surveyLabel}>Độ tuổi:</Text><Text style={dynamicStyles.surveyValue}>{surveyAge || 'Chưa rõ'}</Text></View>
              <View style={dynamicStyles.surveyRow}><Text style={dynamicStyles.surveyLabel}>Chu trình:</Text><Text style={dynamicStyles.surveyValue}>{surveyRoutine || 'Chưa rõ'}</Text></View>
              <View style={dynamicStyles.surveyRow}><Text style={dynamicStyles.surveyLabel}>Ngân sách:</Text><Text style={dynamicStyles.surveyValue}>{surveyBudget || 'Chưa rõ'}</Text></View>
            </View>

            {recommendedProducts.length > 0 ? (
              <View style={dynamicStyles.recommendSection}>
                <Text style={dynamicStyles.recommendTitle}>✨ Sản phẩm gợi ý dành riêng cho bạn</Text>
                <View style={dynamicStyles.productList}>
                  {recommendedProducts.map(product => (
                    <View key={product._id} style={dynamicStyles.productCard}>
                      <View style={dynamicStyles.productInfoRow}>
                        <Image source={{ uri: product.image }} style={dynamicStyles.productImage} />
                        <View style={dynamicStyles.productTextContent}>
                          <Text style={dynamicStyles.productName}>{product.name}</Text>
                          <Text style={dynamicStyles.productDetail}>{product.detail}</Text>
                          <Text style={dynamicStyles.productPrice}>{product.price}</Text>
                        </View>
                      </View>
                      <View style={dynamicStyles.actionRow}>
                        <Pressable style={dynamicStyles.usageButton} onPress={() => handleShowUsage(product.usage)}>
                          <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
                          <Text style={dynamicStyles.usageButtonText}>Cách dùng</Text>
                        </Pressable>
                        <Pressable style={dynamicStyles.addToCartButton} onPress={() => handleAddToCart(product)}>
                          <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
                          <Text style={dynamicStyles.addToCartText}>Thêm giỏ</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
                <Pressable style={dynamicStyles.viewAllButton} onPress={() => router.push('/products')}><Text style={dynamicStyles.viewAllText}>Xem tất cả sản phẩm</Text><Ionicons name="arrow-forward" size={16} color={theme.primary} /></Pressable>
              </View>
            ) : (
              <View style={{ marginTop: 10, alignItems: 'center' }}><Text style={{ color: theme.textMuted, fontStyle: 'italic', textAlign: 'center' }}>Không tìm thấy sản phẩm phù hợp với ngân sách của bạn.</Text></View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Pressable style={[dynamicStyles.saveDiaryButton, isSaved && dynamicStyles.saveDiaryButtonSaved]} onPress={saveToDiary} disabled={isSaved}>
                <Ionicons name={isSaved ? "checkmark-circle" : "bookmark-outline"} size={20} color={isSaved ? "#49313C" : "#FFFFFF"} />
                <Text style={[dynamicStyles.saveDiaryText, isSaved && { color: '#49313C' }]}>{isSaved ? "Đã lưu vào Nhật ký" : "Lưu vào Nhật ký da"}</Text>
              </Pressable>
              {isSaved && (<Pressable style={dynamicStyles.viewDiaryButton} onPress={() => router.replace('/diary')}><Ionicons name="arrow-forward" size={20} color="#FFFFFF" /></Pressable>)}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={usageModalVisible} transparent={true} animationType="fade">
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Cách sử dụng</Text>
              <Pressable onPress={() => setUsageModalVisible(false)}><Ionicons name="close" size={24} color={theme.text} /></Pressable>
            </View>
            <Text style={{ fontSize: 14, lineHeight: 22, color: theme.text }}>{currentUsage}</Text>
            <Pressable style={dynamicStyles.modalCloseBtn} onPress={() => setUsageModalVisible(false)}>
              <Text style={dynamicStyles.modalCloseText}>Đã hiểu</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={cartModalVisible} transparent={true} animationType="fade">
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
              <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 15, marginBottom: 10 }}>Thành công!</Text>
              <Text style={{ fontSize: 14, color: theme.textMuted, textAlign: 'center' }}>Sản phẩm đã được thêm vào giỏ hàng của bạn.</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Pressable style={[dynamicStyles.modalCloseBtn, { flex: 1, backgroundColor: theme.background, borderWidth: 1, borderColor: theme.border }]} onPress={() => setCartModalVisible(false)}>
                <Text style={[dynamicStyles.modalCloseText, { color: theme.text }]}>Tiếp tục</Text>
              </Pressable>
              <Pressable style={[dynamicStyles.modalCloseBtn, { flex: 1, backgroundColor: theme.primary }]} onPress={() => { setCartModalVisible(false); router.push('/cart'); }}>
                <Text style={[dynamicStyles.modalCloseText, { color: '#FFF' }]}>Xem giỏ</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
  content: { paddingHorizontal: 20, paddingBottom: 50, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: theme.primary, marginTop: 10, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 13, color: theme.textMuted, lineHeight: 20, textAlign: 'center', marginBottom: 30 },
  imagePicker: { width: '100%', height: 300, backgroundColor: theme.card, borderRadius: 20, borderWidth: 2, borderColor: theme.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 30 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { alignItems: 'center', gap: 10 },
  placeholderText: { color: theme.primary, fontWeight: '700', fontSize: 14 },
  analyzeButton: { backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, width: '100%', borderRadius: 15, gap: 10, marginBottom: 20 },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  resultContainer: { width: '100%', backgroundColor: theme.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.border },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  resultTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  conditionBox: { backgroundColor: theme.isDark ? '#442A32' : '#FCE6EE', padding: 15, borderRadius: 12, marginBottom: 15 },
  conditionLabel: { fontSize: 13, color: theme.textMuted, marginBottom: 5 },
  conditionValue: { fontSize: 20, fontWeight: '900', color: theme.primary },
  confidenceText: { fontSize: 12, color: theme.textMuted, marginTop: 5 },
  surveyBox: { backgroundColor: theme.background, padding: 15, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: theme.border },
  surveyTitle: { fontSize: 14, fontWeight: '800', color: theme.text, marginBottom: 10 },
  surveyRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  surveyLabel: { fontSize: 13, color: theme.textMuted, width: 80, fontWeight: '600' },
  surveyValue: { fontSize: 13, color: theme.primary, fontWeight: '700', flex: 1 },
  recommendSection: { marginTop: 10 },
  recommendTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 15 },
  productList: { gap: 15 },
  productCard: { backgroundColor: theme.background, borderRadius: 15, borderWidth: 1, borderColor: theme.border, padding: 12 },
  productInfoRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  productImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: theme.card },
  productTextContent: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 4 },
  productDetail: { fontSize: 12, color: theme.textMuted, marginBottom: 6 },
  productPrice: { fontSize: 15, fontWeight: '900', color: theme.primary },
  actionRow: { flexDirection: 'row', gap: 10 },
  usageButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.isDark ? '#442A32' : '#FCE6EE', paddingVertical: 10, borderRadius: 10, gap: 5 },
  usageButtonText: { fontSize: 13, fontWeight: '700', color: theme.primary },
  addToCartButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primary, paddingVertical: 10, borderRadius: 10, gap: 5 },
  addToCartText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 5 },
  viewAllText: { fontSize: 14, fontWeight: '700', color: theme.primary },
  saveDiaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.isDark ? '#F5F5F5' : '#49313C', paddingVertical: 15, borderRadius: 15, gap: 8 },
  saveDiaryButtonSaved: { backgroundColor: '#FFC107' },
  saveDiaryText: { fontSize: 15, fontWeight: '800', color: theme.isDark ? '#121212' : '#FFFFFF' },
  viewDiaryButton: { backgroundColor: theme.primary, width: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { width: '90%', maxWidth: 400, backgroundColor: theme.card, borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  modalCloseBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  modalCloseText: { fontSize: 15, fontWeight: '800', color: theme.primary },
});