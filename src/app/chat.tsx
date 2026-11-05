import React, { useState, useRef } from 'react';
// @ts-ignore
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../presentation/contexts/ThemeContext';
import { sendMessageToAI } from '../services/aiApi';

export default function ChatScreen() {
  const { theme } = useTheme();
  
  // 👇 Sửa type của useRef để hết lỗi
  const scrollViewRef = useRef<any>(null);
  
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<any[]>([
    { id: '1', role: 'model', text: 'Xin chào! Mình là BeautyTech AI. Bạn cần tư vấn gì về tình trạng da hôm nay không?' }
  ]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText("");
    
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user', text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const historyForAI = newMessages
        .filter(msg => msg.id !== '1')
        .map(msg => ({
          role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: msg.text
        }));

      const aiResponse = await sendMessageToAI(userMsg, historyForAI);
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: aiResponse }]);
    } catch (error: any) {
      const errorMessage = error.message?.includes('401') 
        ? 'Lỗi API Key (Vui lòng kiểm tra lại file .env)' 
        : 'Hệ thống AI đang bận một chút, bạn thử lại sau nhé!';
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen}>
      <View style={{ width: 70, paddingTop: 30}} /> 
      <View style={dynamicStyles.header}>
        <Pressable style={dynamicStyles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/home')}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <View style={{ alignItems: 'center'}}>
          <Text style={dynamicStyles.headerTitle}>BeautyTech AI</Text>
          <Text style={dynamicStyles.headerSubtitle}>Chuyên gia da liễu của bạn</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView ref={scrollViewRef as any} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={dynamicStyles.chatContainer}
        >
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                dynamicStyles.messageBubble, 
                msg.role === 'user' ? dynamicStyles.userBubble : dynamicStyles.aiBubble
              ]}
            >
              {msg.role === 'model' && (
                <View style={dynamicStyles.aiAvatar}>
                  <Ionicons name="sparkles" size={16} color="#FFF" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={msg.role === 'user' ? dynamicStyles.userText : dynamicStyles.aiText}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[dynamicStyles.messageBubble, dynamicStyles.aiBubble]}>
              <View style={dynamicStyles.aiAvatar}><Ionicons name="sparkles" size={16} color="#FFF" /></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={dynamicStyles.aiText}>AI đang suy nghĩ...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.input}
            placeholder="Hỏi về tình trạng da của bạn..."
            placeholderTextColor={theme.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable 
            style={[dynamicStyles.sendButton, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.border },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? '#2A2A2A' : '#F8EDF0', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  headerSubtitle: { fontSize: 11, color: theme.primary, fontWeight: '600', marginTop: 2 },
  
  chatContainer: { padding: 20, paddingBottom: 30, gap: 16 },
  messageBubble: { flexDirection: 'row', maxWidth: '85%', padding: 14, borderRadius: 16 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: theme.primary, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderBottomLeftRadius: 4 },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 2 },
  userText: { color: '#FFF', fontSize: 15, lineHeight: 22 },
  aiText: { color: theme.text, fontSize: 15, lineHeight: 22 },

  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 15, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border },
  input: { flex: 1, backgroundColor: theme.background, borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: theme.text, maxHeight: 100, borderWidth: 1, borderColor: theme.border },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
});