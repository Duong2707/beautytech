import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const skinTypes = ['Da dầu', 'Da khô', 'Da hỗn hợp', 'Da nhạy cảm', 'Da thường'];
const skinConcerns = [
  'Lỗ chân lông to', 'Da không đều màu', 'Nếp nhăn / Lão hóa', 
  'Thiếu ẩm / Bong tróc', 'Quầng thâm mắt', 'Da xỉn màu', 'Dị ứng / Kích ứng'
];
const ageRanges = ['Dưới 18', '18 - 24', '25 - 30', 'Trên 30'];
const routines = ['Mới bắt đầu', 'Cơ bản (3 bước)', 'Nâng cao (5+ bước)'];
const budgets = ['Dưới 200k', '200k - 500k', 'Trên 500k', 'Không quan trọng'];

export default function SurveyScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedAge, setSelectedAge] = useState<string>('');
  const [selectedRoutine, setSelectedRoutine] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');

  const toggleConcern = (concern: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(concern) ? prev.filter((item) => item !== concern) : [...prev, concern]
    );
  };

  const handleNext = () => {
    router.push({
      pathname: '/analyze',
      params: { 
        surveySkinType: selectedType, 
        surveyConcerns: selectedConcerns.join(','),
        surveyAge: selectedAge,
        surveyRoutine: selectedRoutine,
        surveyBudget: selectedBudget
      }
    });
  };

  const isComplete = selectedType && selectedConcerns.length > 0 && selectedAge && selectedRoutine && selectedBudget;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFAF8" />
      
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/home")}>
          <Ionicons name="chevron-back" size={24} color="#49313C" />
        </Pressable>
        <Text style={styles.headerTitle}>Khảo sát làn da</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Chào bạn! 👋</Text>
        <Text style={styles.subtitle}>Hãy dành 1 phút chia sẻ về làn da. AI sẽ kết hợp với thông tin này để đưa ra phác đồ chăm sóc tốt nhất.</Text>

        {/* 1. Loại da */}
        <View style={styles.section}>
          <Text style={styles.question}>1. Bạn nghĩ da mình thuộc loại nào?</Text>
          <View style={styles.optionsGrid}>
            {skinTypes.map((type) => (
              <Pressable key={type} style={[styles.optionBtn, selectedType === type && styles.optionBtnActive]} onPress={() => setSelectedType(type)}>
                <Text style={[styles.optionText, selectedType === type && styles.optionTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 2. Vấn đề da */}
        <View style={styles.section}>
          <Text style={styles.question}>2. Vấn đề bạn đang lo lắng? (Chọn nhiều)</Text>
          <View style={styles.optionsGrid}>
            {skinConcerns.map((concern) => {
              const isSelected = selectedConcerns.includes(concern);
              return (
                <Pressable key={concern} style={[styles.optionBtn, isSelected && styles.optionBtnActive]} onPress={() => toggleConcern(concern)}>
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{concern}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 3. Độ tuổi */}
        <View style={styles.section}>
          <Text style={styles.question}>3. Độ tuổi của bạn?</Text>
          <View style={styles.optionsGrid}>
            {ageRanges.map((age) => (
              <Pressable key={age} style={[styles.optionBtn, selectedAge === age && styles.optionBtnActive]} onPress={() => setSelectedAge(age)}>
                <Text style={[styles.optionText, selectedAge === age && styles.optionTextActive]}>{age}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 4. Chu trình chăm sóc */}
        <View style={styles.section}>
          <Text style={styles.question}>4. Chu trình chăm sóc da hiện tại?</Text>
          <View style={styles.optionsGrid}>
            {routines.map((routine) => (
              <Pressable key={routine} style={[styles.optionBtn, selectedRoutine === routine && styles.optionBtnActive]} onPress={() => setSelectedRoutine(routine)}>
                <Text style={[styles.optionText, selectedRoutine === routine && styles.optionTextActive]}>{routine}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 5. Ngân sách (MỚI) */}
        <View style={styles.section}>
          <Text style={styles.question}>5. Ngân sách bạn dự kiến cho sản phẩm?</Text>
          <View style={styles.optionsGrid}>
            {budgets.map((budget) => (
              <Pressable key={budget} style={[styles.optionBtn, selectedBudget === budget && styles.optionBtnActive]} onPress={() => setSelectedBudget(budget)}>
                <Text style={[styles.optionText, selectedBudget === budget && styles.optionTextActive]}>{budget}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={[styles.nextButton, !isComplete && { opacity: 0.5 }]} onPress={handleNext} disabled={!isComplete}>
          <Text style={styles.nextButtonText}>Tiếp tục quét da</Text>
          <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFAF8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#49313C' },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '900', color: '#BC6280', marginTop: 10, marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#8A6C78', lineHeight: 22, marginBottom: 30 },
  section: { marginBottom: 25 },
  question: { fontSize: 15, fontWeight: '800', color: '#49313C', marginBottom: 15 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E8D5DC', backgroundColor: '#FFFFFF' },
  optionBtnActive: { backgroundColor: '#FCE6EE', borderColor: '#BC6280' },
  optionText: { fontSize: 13, color: '#6E535E', fontWeight: '600' },
  optionTextActive: { color: '#BC6280', fontWeight: '800' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F2E4E9' },
  nextButton: { backgroundColor: '#BC6280', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 15, gap: 10 },
  nextButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});