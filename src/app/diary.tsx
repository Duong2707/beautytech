import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../presentation/contexts/ThemeContext';
import BottomNav from "../presentation/components/BottomNav"; // Import BottomNav

const showConfirm = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: onConfirm }
    ]);
  }
};

export default function DiaryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
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

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      {/* HEADER ĐÃ ĐƯỢC CĂN GIỮA */}
      <View style={dynamicStyles.header}>
        <View style={{ width: 70 }} /> 
        
        <Text style={dynamicStyles.headerTitle}>Nhật ký da</Text>
        
        {history.length > 0 ? (
          <Pressable style={{ width: 70, alignItems: 'flex-end' }} onPress={clearAllHistory}>
            <Text style={{ color: '#FF6B6B', fontSize: 13, fontWeight: '600' }}>Xóa tất cả</Text>
          </Pressable>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        <Pressable style={dynamicStyles.newScanBtn} onPress={() => router.push('/survey')}>
          <Ionicons name="scan" size={20} color="#FFFFFF" />
          <Text style={dynamicStyles.newScanText}>Quét da mới (Cập nhật)</Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : history.length === 0 ? (
          <View style={dynamicStyles.emptyState}>
            <Ionicons name="calendar-outline" size={60} color={theme.isDark ? '#333' : '#E8D5DC'} />
            <Text style={dynamicStyles.emptyText}>Chưa có dữ liệu. Hãy quét da ngay hôm nay!</Text>
          </View>
        ) : (
          <View style={dynamicStyles.timeline}>
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
                <View key={item.id} style={dynamicStyles.timelineItem}>
                  <View style={dynamicStyles.timelineLine} />
                  <View style={[dynamicStyles.timelineDot, { backgroundColor: isAcne ? '#FF6B6B' : '#4CAF50' }]} />
                  
                  <View style={dynamicStyles.card}>
                    <View style={dynamicStyles.cardHeader}>
                      <Text style={dynamicStyles.dateText}>{dateStr}</Text>
                      <Pressable style={dynamicStyles.deleteButton} onPress={() => deleteEntry(item.id)}>
                        <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                        <Text style={dynamicStyles.deleteButtonText}>Xóa</Text>
                      </Pressable>
                    </View>

                    <View style={dynamicStyles.resultRow}>
                      <Text style={dynamicStyles.conditionLabel}>Tình trạng: </Text>
                      <Text style={[dynamicStyles.conditionValue, { color: isAcne ? '#FF6B6B' : '#4CAF50' }]}>
                        {isAcne ? 'Da mụn' : 'Da thường'}
                      </Text>
                      <Text style={dynamicStyles.confidence}>({Math.round(item.confidence * 100)}%)</Text>
                    </View>
                    <Text style={dynamicStyles.surveySummary}>
                      Loại da: {item.survey?.type || 'N/A'} | Tuổi: {item.survey?.age || 'N/A'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: theme.text },
  content: { padding: 20, paddingBottom: 100 }, // Thêm paddingBottom để không bị che
  newScanBtn: { backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 15, gap: 10, marginBottom: 30 },
  newScanText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  emptyState: { alignItems: 'center', marginTop: 50, gap: 15 },
  emptyText: { color: theme.textMuted, fontSize: 14, textAlign: 'center' },
  
  timeline: { paddingLeft: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
  timelineLine: { position: 'absolute', left: 7, top: 20, bottom: -20, width: 2, backgroundColor: theme.border },
  timelineDot: { width: 16, height: 16, borderRadius: 8, marginTop: 5, marginRight: 15, zIndex: 1, borderWidth: 3, borderColor: theme.background },
  
  card: { flex: 1, backgroundColor: theme.card, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: theme.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dateText: { fontSize: 13, color: theme.textMuted, fontWeight: '700' },
  
  deleteButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF6B6B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 },
  deleteButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  resultRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  conditionLabel: { fontSize: 14, color: theme.text },
  conditionValue: { fontSize: 16, fontWeight: '900' },
  confidence: { fontSize: 12, color: theme.textMuted, marginLeft: 5 },
  surveySummary: { fontSize: 12, color: theme.primary, backgroundColor: theme.isDark ? '#2C1F23' : '#FCE6EE', padding: 8, borderRadius: 8 },
});