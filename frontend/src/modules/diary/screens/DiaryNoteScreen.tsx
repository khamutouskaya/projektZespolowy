import LayoutContainer from "@/shared/layout/LayoutContainer";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function DiaryEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [dayText, setDayText] = useState(params.text || "");
  const [summaryText, setSummaryText] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const MAX_LENGTH = 180;

  const emojis = ["😊", "🙂", "😐", "😔", "😭", "😴", "😍"];

  const tags = [
    { label: "Spokój", icon: "💙" },
    { label: "Relaks", icon: "🌿" },
    { label: "Energia", icon: "⭐" },
    { label: "Produktywność", icon: "🚀" },
    { label: "Radość", icon: "🌞" },
    { label: "Zmęczenie", icon: "😴" },
  ];

  return (
    <LayoutContainer>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}

          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.back}>← Wszystkie</Text>
            </Pressable>

            <Text style={styles.date}>25.12.2025</Text>

            <Pressable style={styles.testButton}>
              <Text style={styles.testText}>Zrób test</Text>
            </Pressable>
          </View>

          {/* DAY TEXT */}

          <Text style={styles.sectionTitle}>Jak minął Twój dzień?</Text>

          <Pressable
            onPress={() => router.push("/(tabs)/diary/entry")}
            style={styles.card}
          >
            <Text style={styles.placeholder}>
              {params.text
                ? params.text.slice(0, 140) +
                  (params.text.length > 140 ? "..." : "")
                : "Napisz o swoim dniu..."}
            </Text>
          </Pressable>

          {/* SUMMARY */}

          <Text style={styles.sectionTitle}>Podsumowanie dnia</Text>

          <View style={styles.card}>
            <TextInput
              multiline
              maxLength={MAX_LENGTH}
              value={summaryText}
              onChangeText={setSummaryText}
              placeholder="Podsumowanie bedzie gotowe o 22:00"
              placeholderTextColor="#6b7280"
              style={styles.textInput}
            />
          </View>

          {/* MOOD */}

          <Text style={styles.sectionTitle}>Jak się dziś czułaś?</Text>

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

          {/* TAGS */}

          <Text style={styles.sectionTitle}>Tag dnia</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emojiRow}
          >
            {tags.map((tag) => (
              <Pressable
                key={tag.label}
                onPress={() => setSelectedTag(tag.label)}
                style={[
                  styles.tag,
                  selectedTag === tag.label && styles.tagSelected,
                ]}
              >
                <Text style={styles.tagText}>
                  {tag.icon} {tag.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 0, // немного воздуха сверху
    paddingHorizontal: 20,
    paddingBottom: 80,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 25,
    paddingVertical: 10,

    shadowColor: "#7c7171",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    elevation: 4, // Android
  },

  placeholder: {
    fontSize: 15,
    color: "#6b7280",
  },

  back: {
    fontSize: 16,
    color: "#375a85",
    fontWeight: "500",
  },

  date: {
    fontSize: 14,
    color: "#6b7280",
  },

  testButton: {
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  testText: {
    fontSize: 14,
    color: "#375a85",
    fontWeight: "500",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#375a85",
    marginBottom: 13,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 25,
    minHeight: 170,
  },

  textInput: {
    fontSize: 15,
    color: "#1f2937",
    lineHeight: 22,
    textAlignVertical: "top",
    minHeight: 140,
  },

  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  emojiButton: {
    padding: 6,
    borderRadius: 10,
    marginRight: 16,
  },

  emojiSelected: {
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  emoji: {
    fontSize: 28,
  },

  tagRow: {
    flexDirection: "row",
    gap: 10,
  },

  tag: {
    backgroundColor: "rgba(255,255,255,0.65)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginRight: 16,
    shadowColor: "#c8bbbb",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  tagSelected: {
    backgroundColor: "#ede1fc",

    shadowColor: "#ccc5ef",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  tagText: {
    fontSize: 13,
    color: "#375a85",
  },
});
