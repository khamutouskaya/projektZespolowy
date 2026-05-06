import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
type Props = {
  selectedEmoji: string | null;
  onSelect: (emoji: string) => void;
};

// To teraz wysyła emotkę w górę
export default function MoodSelector({ selectedEmoji, onSelect }: Props) {
  const emojis = ["😊", "🙂", "😐", "😔", "😭", "😴", "😍"];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.emojiRow}
    >
      {emojis.map((emoji) => (
        <Pressable
          key={emoji}
          onPress={() => onSelect(emoji)}
          style={[
            styles.emojiButton,
            selectedEmoji === emoji && styles.emojiSelected,
          ]}
        >
          <Text style={styles.emoji}>{emoji}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: "row",
    justifyContent: "flex-start",

    marginBottom: 10,
    paddingLeft: 17,
  },

  emojiButton: {
    padding: 8,
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },

  emojiSelected: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderColor: "rgba(255,255,255,0.9)",
  },

  emoji: {
    fontSize: 30,
  },
});
