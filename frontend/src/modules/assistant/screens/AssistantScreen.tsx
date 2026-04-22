import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useChat } from "../hooks/useChat";
import { MessageBubble } from "../components/MessageBubble";

export function AssistantScreen() {
  const { messages, isLoading, sendMessage } = useChat();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  return (
    // KeyboardAvoidingView — поднимает поле ввода когда появляется клавиатура
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        // Плейсхолдер когда чат пустой
        ListEmptyComponent={
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🤖</Text>
            <Text style={styles.placeholderTitle}>Привет! Я твой помощник</Text>
            <Text style={styles.placeholderText}>
              Напиши мне что угодно — отвечу на вопросы, помогу разобраться с
              мыслями или просто поговорю.
            </Text>
          </View>
        }
      />

      {/* Индикатор "печатает..." */}
      {isLoading && (
        <View style={styles.typing}>
          <ActivityIndicator size="small" />
          <Text style={styles.typingText}>Печатает...</Text>
        </View>
      )}

      {/* Поле ввода */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Напиши сообщение..."
          multiline
          onSubmitEditing={() => { void sendMessage(inputText); setInputText(""); }}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={() => { void sendMessage(inputText); setInputText(""); }}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  listContent: { paddingTop: 16, paddingBottom: 8, flexGrow: 1 },

  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 80,
  },
  placeholderEmoji: { fontSize: 48, marginBottom: 16 },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  placeholderText: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
  },
  typing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  typingText: { fontSize: 13, color: "#888" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#ccc" },
  sendBtnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
