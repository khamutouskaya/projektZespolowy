import { View, Text, Pressable, StyleSheet } from "react-native";
import { useState } from "react";

export default function TagSelector() {
  const [selected, setSelected] = useState<string | null>(null);

  const tags = [
    { label: "Spokój", icon: "💙" },
    { label: "Relaks", icon: "🌿" },
    { label: "Energia", icon: "⭐" },
  ];

  return (
    <>
      <Text style={styles.title}>Tag dnia</Text>

      <View style={styles.row}>
        {tags.map((tag) => (
          <Pressable
            key={tag.label}
            onPress={() => setSelected(tag.label)}
            style={[styles.tag, selected === tag.label && styles.selected]}
          >
            <Text style={styles.text}>
              {tag.icon} {tag.label}
            </Text>
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
