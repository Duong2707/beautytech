import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../presentation/contexts/ThemeContext';

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
  const { theme } = useTheme();
  
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
  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      <View style={dynamicStyles.header}>
        <Pressable style={dynamicStyles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/home")}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={dynamicStyles.headerTitle}>Khảo sát làn da</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={dynamicStyles.content}>
        <Text style={dynamicStyles.title}>Chào bạn! 👋</Text>
        <Text style={dynamicStyles.subtitle}>Hãy dành 1 phút chia sẻ về làn da. AI sẽ kết hợp với thông tin này để đưa ra phác đồ chăm sóc tốt nhất.</Text>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.question}>1. Bạn nghĩ da mình thuộc loại nào?</Text>
          <View style={dynamicStyles.optionsGrid}>
            {skinTypes.map((type) => (
              <Pressable key={type} style={[dynamicStyles.optionBtn, selectedType === type && dynamicStyles.optionBtnActive]} onPress={() => setSelectedType(type)}>
                <Text style={[dynamicStyles.optionText, selectedType === type && dynamicStyles.optionTextActive]}>{type}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.question}>2. Vấn đề bạn đang lo lắng? (Chọn nhiều)</Text>
          <View style={dynamicStyles.optionsGrid}>
            {skinConcerns.map((concern) => {
              const isSelected = selectedConcerns.includes(concern);
              return (
                <Pressable key={concern} style={[dynamicStyles.optionBtn, isSelected && dynamicStyles.optionBtnActive]} onPress={() => toggleConcern(concern)}>
                  <Text style={[dynamicStyles.optionText, isSelected && dynamicStyles.optionTextActive]}>{concern}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.question}>3. Độ tuổi của bạn?</Text>
          <View style={dynamicStyles.optionsGrid}>
            {ageRanges.map((age) => (
              <Pressable key={age} style={[dynamicStyles.optionBtn, selectedAge === age && dynamicStyles.optionBtnActive]} onPress={() => setSelectedAge(age)}>
                <Text style={[dynamicStyles.optionText, selectedAge === age && dynamicStyles.optionTextActive]}>{age}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.question}>4. Chu trình chăm sóc da hiện tại?</Text>
          <View style={dynamicStyles.optionsGrid}>
            {routines.map((routine) => (
              <Pressable key={routine} style={[dynamicStyles.optionBtn, selectedRoutine === routine && dynamicStyles.optionBtnActive]} onPress={() => setSelectedRoutine(routine)}>
                <Text style={[dynamicStyles.optionText, selectedRoutine === routine && dynamicStyles.optionTextActive]}>{routine}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.question}>5. Ngân sách dự kiến cho sản phẩm?</Text>
          <View style={dynamicStyles.optionsGrid}>
            {budgets.map((budget) => (
              <Pressable key={budget} style={[dynamicStyles.optionBtn, selectedBudget === budget && dynamicStyles.optionBtnActive]} onPress={() => setSelectedBudget(budget)}>
                <Text style={[dynamicStyles.optionText, selectedBudget === budget && dynamicStyles.optionTextActive]}>{budget}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={dynamicStyles.bottomBar}>
        <Pressable style={[dynamicStyles.nextButton, !isComplete && { opacity: 0.5 }]} onPress={handleNext} disabled={!isComplete}>
          <Text style={dynamicStyles.nextButtonText}>Tiếp tục quét da</Text>
          <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '900', color: theme.primary, marginTop: 10, marginBottom: 10 },
  subtitle: { fontSize: 14, color: theme.textMuted, lineHeight: 22, marginBottom: 30 },
  section: { marginBottom: 25 },
  question: { fontSize: 15, fontWeight: '800', color: theme.text, marginBottom: 15 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card },
  optionBtnActive: { backgroundColor: theme.isDark ? '#442A32' : '#FCE6EE', borderColor: theme.primary },
  optionText: { fontSize: 13, color: theme.textMuted, fontWeight: '600' },
  optionTextActive: { color: theme.primary, fontWeight: '800' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border },
  nextButton: { backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 15, gap: 10 },
  nextButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});