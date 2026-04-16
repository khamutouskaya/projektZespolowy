import { View, Text, StyleSheet } from "react-native";
import { Message } from "../types/assistant.types";
import { colors } from "@/shared/theme/colors";

interface Props {
  message: Message;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
      <View
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}
      >
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAI]}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 6,
    marginHorizontal: 4,
  },
  rowLeft: {
    alignItems: "flex-start", // AI — прижать влево
  },
  rowRight: {
    alignItems: "flex-end", // пользователь — прижать вправо
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleAI: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 4, // "хвостик" пузырька слева
    borderWidth: 0.2,
    borderColor: "#ccc",
  },
  bubbleUser: {
    backgroundColor: colors.text.primary, // ← замени на цвет твоей темы
    borderBottomRightRadius: 4,
    borderWidth: 0.2,
    borderColor: "#ccc",
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  textAI: {
    color: "#1a1a1a",
  },
  textUser: {
    color: "#ffffff",
  },
});
