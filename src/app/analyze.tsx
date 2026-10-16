import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { skinService, SkinAnalysisResult } from '../data/datasources/remote/skinService';

export default function AnalyzeScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SkinAnalysisResult['data'] | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập camera');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      Alert.alert('Lỗi', 'Vui lòng chọn hoặc chụp ảnh');
      return;
    }

    setLoading(true);
    try {
      const res = await skinService.analyze(image);
      setResult(res.data);
    } catch (error: any) {
      console.error('Analyze error:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Phân tích thất bại';
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2b2b32" />
          </Pressable>
          <Text style={styles.headerTitle}>Phân tích da</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.imageBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera-outline" size={60} color="#b5b9ca" />
              <Text style={styles.placeholderText}>Chưa có ảnh</Text>
            </View>
          )}
        </View>

        <View style={styles.pickRow}>
          <Pressable style={styles.pickBtn} onPress={pickImage}>
            <Ionicons name="images-outline" size={20} color="#e76988" />
            <Text style={styles.pickText}>Thư viện</Text>
          </Pressable>
          <Pressable style={styles.pickBtn} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={20} color="#e76988" />
            <Text style={styles.pickText}>Chụp ảnh</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.analyzeBtn,
            (!image || loading) && { opacity: 0.5 },
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleAnalyze}
          disabled={!image || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="sparkles-outline" size={20} color="#fff" />
              <Text style={styles.analyzeText}>Phân tích</Text>
            </>
          )}
        </Pressable>

        {loading && (
          <Text style={styles.loadingText}>
            AI đang phân tích... (5-10 giây)
          </Text>
        )}

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Kết quả phân tích</Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Tình trạng da:</Text>
              <Text
                style={[
                  styles.resultValue,
                  {
                    color:
                      result.skinCondition === 'Acne' ? '#eb557a' : '#2ecc71',
                  },
                ]}
              >
                {result.skinCondition === 'Acne' ? 'Da mụn' : 'Da thường'}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Độ tin cậy:</Text>
              <Text style={styles.resultValue}>
                {(result.confidence * 100).toFixed(2)}%
              </Text>
            </View>

            <View style={styles.probBox}>
              <Text style={styles.probTitle}>Chi tiết:</Text>
              {Object.entries(result.probabilities).map(([key, val]) => (
                <View key={key} style={styles.probRow}>
                  <Text style={styles.probName}>
                    {key === 'Acne' ? 'Da mụn' : 'Da thường'}
                  </Text>
                  <Text style={styles.probValue}>
                    {(val * 100).toFixed(2)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2b2b32',
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#f7f8fa',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderText: {
    marginTop: 10,
    color: '#b5b9ca',
    fontSize: 14,
  },
  pickRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    justifyContent: 'center',
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e76988',
    backgroundColor: '#fff',
  },
  pickText: {
    color: '#e76988',
    fontSize: 14,
    fontWeight: '600',
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 57,
    backgroundColor: '#f5809d',
    borderRadius: 28.74,
    marginTop: 24,
  },
  analyzeText: {
    color: '#fff',
    fontSize: 16.6,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 12,
    fontSize: 13,
  },
  resultBox: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#fff5f8',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fcd5e0',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e76988',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 15,
    color: '#2b2b32',
  },
  resultValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2b2b32',
  },
  probBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fcd5e0',
  },
  probTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2b2b32',
    marginBottom: 8,
  },
  probRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  probName: { fontSize: 13, color: '#666' },
  probValue: { fontSize: 13, color: '#666' },
});