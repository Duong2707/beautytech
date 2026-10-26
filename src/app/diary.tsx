import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm hỗ trợ hiển thị xác nhận trên cả Web và Mobile
const showConfirm = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: onConfirm }
    ]);
  }
};

export default function DiaryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('@skin_diary');
      if (data) setHistory(JSON.parse(data));
    } catch (e) {
      console.log('Lỗi đọc nhật ký', e);
    } finally {
      setLoading(false);
    }
  };

  const clearAllHistory = () => {
    showConfirm('Xóa tất cả', 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử nhật ký da?', async () => {
      await AsyncStorage.removeItem('@skin_diary');
      setHistory([]);
    });
  };

  const deleteEntry = (id: string) => {
    showConfirm('Xóa bản ghi', 'Bạn có chắc chắn muốn xóa kết quả quét da này không?', async () => {
      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);
      await AsyncStorage.setItem('@skin_diary', JSON.stringify(newHistory));
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhật ký da</Text>
        {history.length > 0 && (
          <Pressable onPress={clearAllHistory}>
            <Text style={{ color: '#FF6B6B', fontSize: 13, fontWeight: '600' }}>Xóa tất cả</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.newScanBtn} onPress={() => router.push('/survey')}>
          <Ionicons name="scan" size={20} color="#FFFFFF" />
          <Text style={styles.newScanText}>Quét da mới (Cập nhật)</Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator size="large" color="#BC6280" style={{ marginTop: 50 }} />
        ) : history.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color="#E8D5DC" />
            <Text style={styles.emptyText}>Chưa có dữ liệu. Hãy quét da ngay hôm nay!</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {history.map((item) => {
              const dateObj = new Date(item.date);
              const hours = dateObj.getHours().toString().padStart(2, '0');
              const minutes = dateObj.getMinutes().toString().padStart(2, '0');
              const day = dateObj.getDate().toString().padStart(2, '0');
              const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
              const year = dateObj.getFullYear();
              const dateStr = `${hours}:${minutes} - ${day}/${month}/${year}`;
              
              const isAcne = item.skinCondition === 'Acne';

              return (
                <View key={item.id} style={styles.timelineItem}>
                  <View style={styles.timelineLine} />
                  <View style={[styles.timelineDot, { backgroundColor: isAcne ? '#FF6B6B' : '#4CAF50' }]} />
                  
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.dateText}>{dateStr}</Text>
                      {/* Nút xóa to rõ */}
                      <Pressable 
                        style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}
                        onPress={() => deleteEntry(item.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.deleteButtonText}>Xóa</Text>
                      </Pressable>
                    </View>

                    <View style={styles.resultRow}>
                      <Text style={styles.conditionLabel}>Tình trạng: </Text>
                      <Text style={[styles.conditionValue, { color: isAcne ? '#FF6B6B' : '#4CAF50' }]}>
                        {isAcne ? 'Da mụn' : 'Da thường'}
                      </Text>
                      <Text style={styles.confidence}>({Math.round(item.confidence * 100)}%)</Text>
                    </View>
                    <Text style={styles.surveySummary}>
                      Loại da: {item.survey?.type || 'N/A'} | Tuổi: {item.survey?.age || 'N/A'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFAF8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#49313C' },
  content: { padding: 20 },
  newScanBtn: { backgroundColor: '#BC6280', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 15, gap: 10, marginBottom: 30 },
  newScanText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  emptyState: { alignItems: 'center', marginTop: 50, gap: 15 },
  emptyText: { color: '#8A6C78', fontSize: 14, textAlign: 'center' },
  
  timeline: { paddingLeft: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
  timelineLine: { position: 'absolute', left: 7, top: 20, bottom: -20, width: 2, backgroundColor: '#F0DDE4' },
  timelineDot: { width: 16, height: 16, borderRadius: 8, marginTop: 5, marginRight: 15, zIndex: 1, borderWidth: 3, borderColor: '#FFFAF8' },
  
  card: { flex: 1, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#F0DDE4', shadowColor: '#9B6177', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dateText: { fontSize: 13, color: '#8A6C78', fontWeight: '700' },
  
  deleteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 },
  deleteButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  resultRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  conditionLabel: { fontSize: 14, color: '#49313C' },
  conditionValue: { fontSize: 16, fontWeight: '900' },
  confidence: { fontSize: 12, color: '#A58B93', marginLeft: 5 },
  surveySummary: { fontSize: 12, color: '#BC6280', backgroundColor: '#FCE6EE', padding: 8, borderRadius: 8 },
});