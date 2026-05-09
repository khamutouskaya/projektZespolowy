import { useDiaryEntries } from "@/modules/diary/hooks/useDiaryEntries";
import { diaryTextTransfer } from "@/modules/diary/services/diaryTextTransfer";
import { testResultTransfer, TestResult } from "@/modules/diary/services/testResultTransfer";
import LayoutContainer from "@/shared/layout/LayoutContainer";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState, useRef } from "react";
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
  const params = useLocalSearchParams<{ text?: string; id?: string; tag?: string; mood?: string; preview?: string }>();
  const { addEntry, updateEntry } = useDiaryEntries();
  const isEditing = !!params.id;

  const [preview, setpreview] = useState(params.preview ?? "");
  const [selectedMood, setSelectedMood] = useState<string | null>(params.mood ?? null);
  const [selectedTag, setSelectedTag] = useState<string | null>(params.tag ?? null);
  const [noteText, setNoteText] = useState(params.text ?? "");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
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

  useFocusEffect(
    useCallback(() => {
      const { text } = diaryTextTransfer.get();
      if (text !== null) {
        setNoteText(text);
        diaryTextTransfer.clear();
      }
      const result = testResultTransfer.get();
      if (result !== null) {
        setTestResult(result);
      }
    }, []),
  );

  const handleSave = () => {
    if (!noteText.trim() && !preview.trim()) {
      router.back();
      return;
    }

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
      title: (() => {
        const firstLine = noteText.slice(0, noteText.indexOf("\n") === -1 ? undefined : noteText.indexOf("\n")).trim();
        return firstLine || new Date().toLocaleDateString("pl-PL");
      })(),
      date: existingDate ?? new Date().toLocaleDateString("pl-PL"),
      section: "today" as const,
      duration,
    };

    if (isEditing && params.id) {
      updateEntry(params.id, payload);
    } else {
      addEntry(payload);
    }
    router.back();
  };

  return (
    <LayoutContainer>
      <View style={styles.stickyHeader}>
        <DiaryNoteHeader
          date={new Date().toLocaleDateString("pl-PL")}
          onBack={() => router.back()}
          onSave={handleSave}
        />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* DAY TEXT */}
          <View style={styles.inputCard}>
            <DiaryInput
              text={noteText}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/diary/entry",
                  params: {
                    text: noteText,
                    id: params.id,
                    tag: selectedTag ?? "",
                    mood: selectedMood ?? "",
                    preview,
                  },
                })
              }
            />
          </View>

          {/* SUMMARY */}
          <View style={styles.inputCard}>
            <View style={styles.summaryTitleRow}>
              <Text style={styles.summaryTitle}>Podsumowanie dnia</Text>
              <Pressable
                style={styles.testChip}
                onPress={() =>
                  router.push(
                    testResult
                      ? "/(tabs)/diary/test?viewResult=1"
                      : "/(tabs)/diary/test"
                  )
                }
              >
                <Text style={styles.testChipText}>
                  {testResult ? "Podgląd testu ›" : "Zrób test ›"}
                </Text>
              </Pressable>
            </View>
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
        </ScrollView>
      </TouchableWithoutFeedback>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  stickyHeader: {
    paddingHorizontal: 20,
  },
  header: {},
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#375a85",
    marginBottom: 15,
  },
  inputCard: {
    marginBottom: 25,
  },
  emojiTagRows: {
    marginHorizontal: -17,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#375a85",
  },
  summaryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  testChip: {
    backgroundColor: "hsl(253, 45%, 90%)",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "hsl(200, 2%, 74%)",
    shadowColor: "#375a85",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  testChipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#375a85",
  },
  testResultCard: {
    backgroundColor: "#f5f7fb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#e0e6f0",
  },
  testResultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  testResultTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#375a85",
  },
  testResultScoreBadge: {
    backgroundColor: "hsl(253, 45%, 90%)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  testResultScoreText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#375a85",
  },
  testZoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  testZoneIcon: { fontSize: 16, width: 22 },
  testZoneBarWrap: { flex: 1 },
  testZoneLabel: {
    fontSize: 11,
    color: "#8a9ab0",
    fontWeight: "600",
    marginBottom: 3,
  },
  testZoneBarBg: {
    height: 6,
    backgroundColor: "#dde3ee",
    borderRadius: 3,
    overflow: "hidden",
  },
  testZoneBarFill: { height: "100%", borderRadius: 3 },
  testZoneScore: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8a9ab0",
    width: 32,
    textAlign: "right",
  },
});
