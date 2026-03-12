import { Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useState } from "react";

export default function MoodSelector() {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const emojis = ["😊", "🙂", "😐", "😔", "😭", "😴", "😍"];

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.emojiRow}
      >
        {emojis.map((emoji) => (
          <Pressable
            key={emoji}
            onPress={() => setSelectedEmoji(emoji)}
            style={[
              styles.emojiButton,
              selectedEmoji === emoji && styles.emojiSelected,
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  emojiButton: {
    padding: 5,
    borderRadius: 10,
    marginRight: 16,
  },

  emojiSelected: {
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  emoji: {
    fontSize: 30,
  },
});
