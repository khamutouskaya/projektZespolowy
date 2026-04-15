import { colors } from "@/shared/theme/colors";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

type Props = {
  selectedTag: string | null;
  onSelect: (tag: string) => void;
};
// służy to wysyłania stanu w górę

export default function TagSelector({ selectedTag, onSelect }: Props) {
  const tags = [
    { label: "Spokój", icon: "💙" },
    { label: "Relaks", icon: "🌿" },
    { label: "Energia", icon: "⭐" },
    { label: "Produktywność", icon: "🚀" },
    { label: "Radość", icon: "🌞" },
    { label: "Zmęczenie", icon: "😴" },
  ]; //NOTE: jesli jest to zmieniane, to nalezy tez to uwzglednic w DiaryEntryCard (diaryScreen)

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.emojiRow}
    >
      {tags.map((tag) => (
        <Pressable
          key={tag.label}
          onPress={() => onSelect(tag.label)}
          style={[styles.tag, selectedTag === tag.label && styles.tagSelected]}
        >
          <Text style={styles.tagText}>
            {tag.icon} {tag.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  tagRow: {
    flexDirection: "row",
    gap: 10,
  },

  tag: {
    backgroundColor: colors.background.glass,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 16,

    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  tagSelected: {
    backgroundColor: "#ede1fc",

    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  tagText: {
    fontSize: 14,
    color: "#375a85",
  },
});
