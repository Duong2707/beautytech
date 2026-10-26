import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Image, Alert, ActivityIndicator, ScrollView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../data/datasources/remote/api';
import { useCart } from '../presentation/contexts/CartContext'; 

const mockProducts = [
  { id: '1', name: 'Glow Serum', detail: 'Serum dưỡng sáng da', price: '259.000đ', priceValue: 259000, image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80', target: ['Da không đều màu', 'Da xỉn màu', 'Da dầu'], usage: 'Thoa 2-3 giọt lên da sạch vào buổi sáng và tối. Vỗ nhẹ để thẩm thấu.' },
  { id: '2', name: 'Hydra Cream', detail: 'Kem dưỡng ẩm sâu', price: '320.000đ', priceValue: 320000, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop&q=80', target: ['Da khô', 'Thiếu ẩm / Bong tróc', 'Da thường'], usage: 'Lấy một lượng vừa đủ thoa đều lên mặt sau bước dùng serum.' },
  { id: '3', name: 'Pure Cleanser', detail: 'Sữa rửa mặt dịu nhẹ', price: '189.000đ', priceValue: 189000, image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&auto=format&fit=crop&q=80', target: ['Da dầu', 'Lỗ chân lông to', 'Da nhạy cảm', 'Dị ứng / Kích ứng'], usage: 'Lấy một lượng nhỏ tạo bọt, massage nhẹ nhàng trên mặt ướt, sau đó rửa sạch.' },
  { id: '4', name: 'La Roche-Posay Effaclar', detail: 'Sữa rửa mặt cho da mụn', price: '550.000đ', priceValue: 550000, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&auto=format&fit=crop&q=80', target: ['Da dầu', 'Lỗ chân lông to', 'Mụn ẩn'], usage: 'Dùng 2 lần/ngày, tạo bọt và rửa sạch.' }, 
];

export default function AnalyzeScreen() {
  const router = useRouter();
  const { addToCart } = useCart(); 
  
  const { surveySkinType, surveyConcerns, surveyAge, surveyRoutine, surveyBudget } = useLocalSearchParams<{ 
    surveySkinType?: string, surveyConcerns?: string, surveyAge?: string, surveyRoutine?: string, surveyBudget?: string
  }>();
  
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Quyền truy cập', 'Bạn cần cấp quyền truy cập thư viện ảnh.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!pickerResult.canceled) {
      setImage(pickerResult.assets[0].uri);
      setResult(null); 
      setIsSaved(false);
    }
  };

  const handleAnalyze = async () => {
    if (!image) { Alert.alert('Lỗi', 'Vui lòng chọn hoặc chụp ảnh'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        const response = await fetch(image);
        const blob = await response.blob();
        formData.append('image', blob, 'photo.jpg');
      } else {
        formData.append('image', { uri: image, name: 'photo.jpg', type: 'image/jpeg' } as any);
      }
      const res = await api.post('/api/skin/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      setIsSaved(false);
    } catch (error: any) {
      console.error('Analyze error:', error);
      Alert.alert('Lỗi', error.response?.data?.detail || 'Không thể phân tích ảnh.');
    } finally {
      setLoading(false);
    }
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

  // Cập nhật: Truyền thêm size mặc định là 'Mặc định' vào giỏ hàng
  const handleAddToCart = (product: any) => {
    addToCart(product, 1, 'Mặc định'); 
    Alert.alert('Thành công', `Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const saveToDiary = async () => {
    if (isSaved) return; 
    try {
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        skinCondition: result.data.skinCondition,
        confidence: result.data.confidence,
        survey: {
          type: surveySkinType,
          concerns: surveyConcerns,
          age: surveyAge,
          routine: surveyRoutine,
          budget: surveyBudget
        }
      };
      const existingData = await AsyncStorage.getItem('@skin_diary');
      const history = existingData ? JSON.parse(existingData) : [];
      history.unshift(newEntry); 
      await AsyncStorage.setItem('@skin_diary', JSON.stringify(history));
      setIsSaved(true);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/home")}>
          <Ionicons name="chevron-back" size={24} color="#49313C" />
        </Pressable>
        <Text style={styles.headerTitle}>Phân tích da AI</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Tải ảnh lên để phân tích</Text>
        <Text style={styles.subtitle}>Chụp rõ khuôn mặt, không đeo kính, ánh sáng tốt.</Text>

        <Pressable style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={50} color="#BC6280" />
              <Text style={styles.placeholderText}>Bấm để chọn ảnh</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          style={[styles.analyzeButton, (!image || loading) && { opacity: 0.5 }]}
          onPress={handleAnalyze}
          disabled={!image || loading}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : (
            <>
              <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
              <Text style={styles.analyzeButtonText}>Bắt đầu phân tích</Text>
            </>
          )}
        </Pressable>

        {result && result.data && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#BC6280" />
              <Text style={styles.resultTitle}>Kết quả phân tích</Text>
            </View>
            
            <View style={styles.conditionBox}>
              <Text style={styles.conditionLabel}>Tình trạng da (Từ AI):</Text>
              <Text style={styles.conditionValue}>
                {result.data.skinCondition === 'Acne' ? 'Da mụn (Acne)' : 'Da thường (Normal)'}
              </Text>
              <Text style={styles.confidenceText}>
                Độ chính xác: {Math.round((result.data.confidence || 0) * 100)}%
              </Text>
            </View>

            <View style={styles.surveyBox}>
              <Text style={styles.surveyTitle}>Thông tin khảo sát của bạn:</Text>
              <View style={styles.surveyRow}><Text style={styles.surveyLabel}>Loại da:</Text><Text style={styles.surveyValue}>{surveySkinType || 'Chưa rõ'}</Text></View>
              <View style={styles.surveyRow}><Text style={styles.surveyLabel}>Vấn đề:</Text><Text style={styles.surveyValue}>{surveyConcerns ? surveyConcerns.split(',').join(', ') : 'Chưa rõ'}</Text></View>
              <View style={styles.surveyRow}><Text style={styles.surveyLabel}>Độ tuổi:</Text><Text style={styles.surveyValue}>{surveyAge || 'Chưa rõ'}</Text></View>
              <View style={styles.surveyRow}><Text style={styles.surveyLabel}>Chu trình:</Text><Text style={styles.surveyValue}>{surveyRoutine || 'Chưa rõ'}</Text></View>
              <View style={styles.surveyRow}><Text style={styles.surveyLabel}>Ngân sách:</Text><Text style={styles.surveyValue}>{surveyBudget || 'Chưa rõ'}</Text></View>
            </View>

            {recommendedProducts.length > 0 ? (
              <View style={styles.recommendSection}>
                <Text style={styles.recommendTitle}>✨ Sản phẩm gợi ý dành riêng cho bạn</Text>
                <View style={styles.productList}>
                  {recommendedProducts.map(product => (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.productInfoRow}>
                        <Image source={{ uri: product.image }} style={styles.productImage} />
                        <View style={styles.productTextContent}>
                          <Text style={styles.productName}>{product.name}</Text>
                          <Text style={styles.productDetail}>{product.detail}</Text>
                          <Text style={styles.productPrice}>{product.price}</Text>
                        </View>
                      </View>
                      <View style={styles.actionRow}>
                        <Pressable style={styles.usageButton} onPress={() => Alert.alert('Cách sử dụng', product.usage)}>
                          <Ionicons name="information-circle-outline" size={16} color="#BC6280" />
                          <Text style={styles.usageButtonText}>Cách dùng</Text>
                        </Pressable>
                        <Pressable style={styles.addToCartButton} onPress={() => handleAddToCart(product)}>
                          <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
                          <Text style={styles.addToCartText}>Thêm giỏ</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
                <Pressable style={styles.viewAllButton} onPress={() => router.push('/products')}>
                  <Text style={styles.viewAllText}>Xem tất cả sản phẩm</Text>
                  <Ionicons name="arrow-forward" size={16} color="#BC6280" />
                </Pressable>
              </View>
            ) : (
              <View style={{ marginTop: 10, alignItems: 'center' }}>
                <Text style={{ color: '#8A6C78', fontStyle: 'italic', textAlign: 'center' }}>Không tìm thấy sản phẩm phù hợp với ngân sách của bạn. Hãy thử quét lại với mức giá khác nhé!</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Pressable style={[styles.saveDiaryButton, isSaved && styles.saveDiaryButtonSaved]} onPress={saveToDiary} disabled={isSaved}>
                <Ionicons name={isSaved ? "checkmark-circle" : "bookmark-outline"} size={20} color={isSaved ? "#49313C" : "#FFFFFF"} />
                <Text style={[styles.saveDiaryText, isSaved && { color: '#49313C' }]}>{isSaved ? "Đã lưu vào Nhật ký" : "Lưu vào Nhật ký da"}</Text>
              </Pressable>
              {isSaved && (
                <Pressable style={styles.viewDiaryButton} onPress={() => router.replace('/diary')}>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </Pressable>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFAF8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#49313C' },
  content: { paddingHorizontal: 20, paddingBottom: 50, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#BC6280', marginTop: 10, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#8A6C78', lineHeight: 20, textAlign: 'center', marginBottom: 30 },
  imagePicker: { width: '100%', height: 300, backgroundColor: '#F5ECEF', borderRadius: 20, borderWidth: 2, borderColor: '#FCE6EE', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 30 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { alignItems: 'center', gap: 10 },
  placeholderText: { color: '#BC6280', fontWeight: '700', fontSize: 14 },
  analyzeButton: { backgroundColor: '#BC6280', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, width: '100%', borderRadius: 15, gap: 10, marginBottom: 20 },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  resultContainer: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F0DDE4', shadowColor: '#9B6177', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  resultTitle: { fontSize: 18, fontWeight: '800', color: '#49313C' },
  conditionBox: { backgroundColor: '#FCE6EE', padding: 15, borderRadius: 12, marginBottom: 15 },
  conditionLabel: { fontSize: 13, color: '#8A6C78', marginBottom: 5 },
  conditionValue: { fontSize: 20, fontWeight: '900', color: '#BC6280' },
  confidenceText: { fontSize: 12, color: '#A58B93', marginTop: 5 },
  surveyBox: { backgroundColor: '#F8F9FA', padding: 15, borderRadius: 12, marginBottom: 25, borderWidth: 1, borderColor: '#EEEEEE' },
  surveyTitle: { fontSize: 14, fontWeight: '800', color: '#49313C', marginBottom: 10 },
  surveyRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  surveyLabel: { fontSize: 13, color: '#8A6C78', width: 80, fontWeight: '600' },
  surveyValue: { fontSize: 13, color: '#BC6280', fontWeight: '700', flex: 1 },
  recommendSection: { marginTop: 10 },
  recommendTitle: { fontSize: 16, fontWeight: '800', color: '#49313C', marginBottom: 15 },
  productList: { gap: 15 },
  productCard: { backgroundColor: '#FFFFFF', borderRadius: 15, borderWidth: 1, borderColor: '#F0DDE4', padding: 12 },
  productInfoRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  productImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#F5ECEF' },
  productTextContent: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '800', color: '#49313C', marginBottom: 4 },
  productDetail: { fontSize: 12, color: '#8A6C78', marginBottom: 6 },
  productPrice: { fontSize: 15, fontWeight: '900', color: '#BC6280' },
  actionRow: { flexDirection: 'row', gap: 10 },
  usageButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FCE6EE', paddingVertical: 10, borderRadius: 10, gap: 5 },
  usageButtonText: { fontSize: 13, fontWeight: '700', color: '#BC6280' },
  addToCartButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#BC6280', paddingVertical: 10, borderRadius: 10, gap: 5 },
  addToCartText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 5 },
  viewAllText: { fontSize: 14, fontWeight: '700', color: '#BC6280' },
  saveDiaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#49313C', paddingVertical: 15, borderRadius: 15, gap: 8 },
  saveDiaryButtonSaved: { backgroundColor: '#FFC107' },
  saveDiaryText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  viewDiaryButton: { backgroundColor: '#BC6280', width: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});