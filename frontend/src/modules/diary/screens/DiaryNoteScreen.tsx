import { useDiaryEntries } from "@/modules/diary/hooks/useDiaryEntries";
import LayoutContainer from "@/shared/layout/LayoutContainer";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DiaryInput from "../components/diaryNote/DayInput";
import DiaryNoteHeader from "../components/diaryNote/DiaryNoteHeader";
import MoodSelector from "../components/diaryNote/MoodSelector";
import SummaryInput from "../components/diaryNote/SummaryInput";
import TagSelector from "../components/diaryNote/TagSelector";
import { useAuthStore } from "@/services/store/useAuthStore";
import { diaryService } from "@/modules/diary/services/diaryService";

export default function DiaryNoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ text?: string; id?: string }>();
  const { addEntry, updateEntry } = useDiaryEntries();
  const isEditing = !!params.id;

  const [preview, setpreview] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [noteText, setNoteText] = useState(params.text ?? "");
  const user = useAuthStore((state) => state.user);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!params.id || !user?.id) return;
    const existing = diaryService.getById(params.id, user.id);
    if (!existing) return;
    setNoteText(params.text ?? existing.content);
    setpreview(existing.preview ?? "");
    setSelectedMood(existing.mood ?? null);
    setSelectedTag(JSON.parse(existing.tags || "[]")[0] ?? null);
  }, [params.id]);

  const handleSave = () => {
    const elapsedMs = Date.now() - startTimeRef.current;
    const elapsedMin = Math.round(elapsedMs / 60000);
    const duration = elapsedMin < 1 ? "< 1 min" : `${elapsedMin} min`;
    const existingDate =
      isEditing && params.id && user?.id
        ? diaryService.getById(params.id, user.id)?.date
        : undefined;

    const payload = {
      content: noteText,
      preview,
      mood: selectedMood ?? "",
      icon: selectedMood ?? "📝",
      tags: selectedTag ? JSON.stringify([selectedTag]) : "[]",
      title:
        noteText.trim().slice(0, 40) || new Date().toLocaleDateString("pl-PL"),
      date: existingDate ?? new Date().toLocaleDateString("pl-PL"),
      section: "today" as const,
      duration,
    };

    if (isEditing && params.id) {
      updateEntry(params.id, payload);
      // TODO: diaryApi.update(params.id, payload) — gdy backend gotowy
    } else {
      addEntry(payload);
      // TODO: diaryApi.create(payload) — gdy backend gotowy
    }
    router.replace("/(tabs)/diary");
  };

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
            <DiaryNoteHeader
              date={new Date().toLocaleDateString("pl-PL")}
              onBack={() => router.back()}
              onTest={handleSave}
            />
          </View>
          {/* DAY TEXT */}
          <View style={styles.inputCard}>
            <Text style={styles.title}>Jak minął Twój dzień?</Text>
            <DiaryInput
              text={noteText}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/diary/entry",
                  params: { text: noteText, id: params.id },
                })
              }
            />
          </View>
          {/* SUMMARY */}
          <View style={styles.inputCard}>
            <Text style={styles.title}>Podsumowanie dnia</Text>
            <SummaryInput summary={preview} onChangeSummary={setpreview} />
          </View>
          {/* MOOD */}
          <Text style={styles.title}>Jak się dziś czułaś?</Text>
          <ScrollView style={styles.emojiTagRows}>
            <MoodSelector
              selectedEmoji={selectedMood}
              onSelect={setSelectedMood}
            />
          </ScrollView>
          {/* TAGS */}
          <Text style={styles.title}>Tag dnia</Text>
          <ScrollView style={styles.emojiTagRows}>
            <TagSelector selectedTag={selectedTag} onSelect={setSelectedTag} />
          </ScrollView>

          {/* SAVE BUTTON - DODANE: brak było przycisku zapisu całości */}
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Zapisz wpis</Text>
          </Pressable>
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
    marginBottom: 25,
    paddingVertical: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#375a85",
    marginBottom: 16,
  },

  inputCard: {
    marginBottom: 25,
  },

  emojiTagRows: {
    marginHorizontal: -17,
    // paddingHorizontal: -50,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#b6cce9",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#355A7A",
  },
});
