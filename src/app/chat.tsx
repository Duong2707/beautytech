import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Import Logic Ngày 8 (Clean Architecture)
import { ChatMessage } from "../domain/entities/ChatMessage";
import { ChatRepositoryImpl } from "../data/repositories/ChatRepositoryImpl";
import { SendMessageUseCase } from "../domain/usecases/chat/SendMessageUseCase";

// Khởi tạo UseCase
const chatRepo = new ChatRepositoryImpl();
const sendMessageUseCase = new SendMessageUseCase(chatRepo);

export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "model",
      text: "Xin chào! Mình là chuyên gia tư vấn da của BeautyTech. Bạn đang gặp vấn đề gì về da, hãy chia sẻ với mình nhé! 🌸",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Gọi UseCase (Kết nối với Gemini API thông qua Repository)
      const replyText = await sendMessageUseCase.execute(userMsg.text, messages);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: replyText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: "Xin lỗi, hiện tại mình đang bận một chút. Bạn thử lại sau nhé!",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAI,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarAI}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.bubbleUser : styles.bubbleAI,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.textUser : styles.textAI,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
            {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace("/home")}>
          <Ionicons name="chevron-back" size={24} color="#49313C" />
        </Pressable>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>BeautyTech AI</Text>
          <Text style={styles.headerSubtitle}>Chuyên gia tư vấn da</Text>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      {/* KHUNG CHAT */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          showsVerticalScrollIndicator={false}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#BC6280" />
            <Text style={styles.loadingText}>AI đang trả lời...</Text>
          </View>
        )}

        {/* THANH NHẬP TIN NHẮN */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập câu hỏi của bạn..."
            placeholderTextColor="#AD9AA0"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[styles.sendButton, !input.trim() && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFAF8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F2E4E9",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8EDF0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleBox: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#49313C",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#A58B93",
    marginTop: 2,
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 15,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "85%",
  },
  messageRowUser: {
    alignSelf: "flex-end",
  },
  messageRowAI: {
    alignSelf: "flex-start",
  },
  avatarAI: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#BC6280",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: "#BC6280",
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: "#F5ECEF",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textUser: {
    color: "#FFFFFF",
  },
  textAI: {
    color: "#49313C",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: "#A58B93",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F2E4E9",
    paddingBottom: Platform.OS === "ios" ? 30 : 15,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5ECEF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 14,
    color: "#49313C",
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#BC6280",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginBottom: 2,
  },
});