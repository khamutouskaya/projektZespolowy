import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import LayoutContainer from "@/shared/layout/LayoutContainer";
import { useRouter, useLocalSearchParams } from "expo-router";
import DiaryNoteHeader from "../components/diaryNote/DiaryNoteHeader";
import DiaryInput from "../components/diaryNote/DayInput";
import SummaryInput from "../components/diaryNote/SummaryInput";
import MoodSelector from "../components/diaryNote/MoodSelector";
import TagSelector from "../components/diaryNote/TagSelector";

export default function DiaryEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [summaryText, setSummaryText] = useState("");

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
              date="25.12.2025"
              onBack={() => router.back()}
              onTest={() => {}}
            />
          </View>

          {/* DAY TEXT */}
          <View style={styles.inputCard}>
            <Text style={styles.title}>Jak minął Twój dzień?</Text>
            <DiaryInput
              text={params.text as string}
              onPress={() => router.push("/(tabs)/diary/entry")}
            />
          </View>
          {/* SUMMARY */}
          <View style={styles.inputCard}>
            <Text style={styles.title}>Podsumowanie dnia</Text>
            <SummaryInput summary={summaryText} />
          </View>

          {/* MOOD */}
          <Text style={styles.title}>Jak się dziś czułaś?</Text>
          <ScrollView style={styles.emojiTagRows}>
            <MoodSelector />
          </ScrollView>

          {/* TAGS */}
          <Text style={styles.title}>Tag dnia</Text>
          <ScrollView style={styles.emojiTagRows}>
            <TagSelector />
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
});
