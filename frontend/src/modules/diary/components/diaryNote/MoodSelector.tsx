import { View, Text, StyleSheet, Pressable } from "react-native";
import { useState } from "react";

export default function MoodSelector() {
  const [selected, setSelected] = useState<string | null>(null);

  const emojis = ["😊", "🙂", "😐", "😔", "😴"];

  return (
    <>
      <Text style={styles.title}>Jak się dziś czułaś?</Text>

      <View style={styles.row}>
        {emojis.map((e) => (
          <Pressable
            key={e}
            onPress={() => setSelected(e)}
            style={[styles.emojiBox, selected === e && styles.selected]}
          >
            <Text style={styles.emoji}>{e}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#375a85",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  emojiBox: {
    padding: 6,
    borderRadius: 10,
  },

  selected: {
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  emoji: {
    fontSize: 28,
  },
});
