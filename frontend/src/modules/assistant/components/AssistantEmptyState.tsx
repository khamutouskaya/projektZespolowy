import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

type Props = {
  prompts: string[];
  onPromptPress: (prompt: string) => void;
};

export function AssistantEmptyState({ prompts, onPromptPress }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Jestem Twoim pomocnikiem</Text>
      <Text style={styles.text}>
        Wpisz wiadomość na dole albo kliknij jedną z gotowych podpowiedzi.
      </Text>

      <View style={styles.promptList}>
        {prompts.map((prompt) => (
          <TouchableOpacity
            key={prompt}
            style={styles.promptButton}
            onPress={() => onPromptPress(prompt)}
          >
            <Text style={styles.promptText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 0.5,
    borderColor: "hsla(300, 1%, 61%, 0.50)",

    // backgroundColor: colors.background.glass, // стеклянный фон
    // borderRadius: 20, // скругление
    // padding: spacing.md, // внутренний отступ

    // shadowColor: colors.shadow.primary, // цвет тени
    // shadowOpacity: 0.2,
    // shadowRadius: 10,
    // shadowOffset: { width: 0, height: 4 },

    // elevation: 6, // Android тень
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#31424D",
  },
  text: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(49,66,77,0.72)",
  },
  promptList: {
    marginTop: 16,
    gap: 10,
  },
  promptButton: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  promptText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#3E5360",
    fontWeight: "600",
  },
});
