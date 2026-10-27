import React, { useState, useRef } from "react";
import BottomNav from "../presentation/components/BottomNav";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatMessage } from "../domain/entities/ChatMessage";
import { ChatRepositoryImpl } from "../data/repositories/ChatRepositoryImpl";
import { SendMessageUseCase } from "../domain/usecases/chat/SendMessageUseCase";
import { useTheme } from "../presentation/contexts/ThemeContext";

const chatRepo = new ChatRepositoryImpl();
const sendMessageUseCase = new SendMessageUseCase(chatRepo);

export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", role: "model", text: "Xin chào! Mình là chuyên gia tư vấn da của BeautyTech. Bạn đang gặp vấn đề gì về da, hãy chia sẻ với mình nhé! 🌸", timestamp: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: input.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const replyText = await sendMessageUseCase.execute(userMsg.text, messages);
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "model", text: replyText, timestamp: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "model", text: "Xin lỗi, hiện tại mình đang bận một chút. Bạn thử lại sau nhé!", timestamp: Date.now() };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View style={[dynamicStyles.messageRow, isUser ? dynamicStyles.messageRowUser : dynamicStyles.messageRowAI]}>
        {!isUser && (
          <View style={dynamicStyles.avatarAI}><Ionicons name="sparkles" size={16} color="#FFFFFF" /></View>
        )}
        <View style={[dynamicStyles.messageBubble, isUser ? dynamicStyles.bubbleUser : dynamicStyles.bubbleAI]}>
          <Text style={[dynamicStyles.messageText, isUser ? dynamicStyles.textUser : dynamicStyles.textAI]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const dynamicStyles = getStyles(theme);

  return (
    <SafeAreaView style={dynamicStyles.screen} edges={["top", "left", "right"]}>
      <View style={dynamicStyles.header}>
        <Pressable style={dynamicStyles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/home")}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </Pressable>
        <View style={dynamicStyles.headerTitleBox}>
          <Text style={dynamicStyles.headerTitle}>BeautyTech AI</Text>
          <Text style={dynamicStyles.headerSubtitle}>Chuyên gia tư vấn da</Text>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView style={dynamicStyles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={dynamicStyles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {loading && (
          <View style={dynamicStyles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={dynamicStyles.loadingText}>AI đang trả lời...</Text>
          </View>
        )}

        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.input}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor={theme.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <Pressable style={[dynamicStyles.sendButton, !input.trim() && { opacity: 0.5 }]} onPress={handleSend} disabled={!input.trim() || loading}>
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.card },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.isDark ? '#2A2A2A' : "#F8EDF0", alignItems: "center", justifyContent: "center" },
  headerTitleBox: { alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "900", color: theme.text },
  headerSubtitle: { fontSize: 10, color: theme.textMuted, marginTop: 2 },
  container: { flex: 1 },
  listContent: { padding: 20, gap: 15 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", maxWidth: "85%" },
  messageRowUser: { alignSelf: "flex-end" },
  messageRowAI: { alignSelf: "flex-start" },
  avatarAI: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center", marginRight: 8, marginBottom: 4 },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  bubbleUser: { backgroundColor: theme.primary, borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: theme.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.border },
  messageText: { fontSize: 14, lineHeight: 20 },
  textUser: { color: "#FFFFFF" },
  textAI: { color: theme.text },
  loadingContainer: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 10, gap: 8 },
  loadingText: { fontSize: 12, color: theme.textMuted, fontStyle: "italic" },
  inputContainer: { flexDirection: "row", alignItems: "flex-end", padding: 15, backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border, paddingBottom: Platform.OS === "ios" ? 30 : 15 },
  input: { flex: 1, backgroundColor: theme.background, borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 14, color: theme.text, maxHeight: 100, borderWidth: 1, borderColor: theme.border },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.primary, alignItems: "center", justifyContent: "center", marginLeft: 10, marginBottom: 2 },
});