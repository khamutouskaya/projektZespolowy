import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  View,
  StyleSheet,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

import { useDiaryEntries } from "@/modules/diary/hooks/useDiaryEntries";
import { DiaryEntry } from "@/modules/diary/diary.types";

import DiaryHeader from "@/modules/diary/components/diaryScreen/DiaryHeader";
import DiaryEntriesSection from "@/modules/diary/components/diaryScreen/DiaryEntriesSection";
import DiarySearch from "@/modules/diary/components/diaryScreen/DiarySearch";
import AddEntryButton from "@/modules/diary/components/diaryScreen/AddEntryButton";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import { spacing } from "@/shared/theme/spacing";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";

function SearchEmpty({ query }: { query: string }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.searchEmpty,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <Ionicons
          name="search-outline"
          size={56}
          color={colors.text.quaternary}
        />
      </Animated.View>
      <Text style={styles.searchEmptyTitle}>Brak wyników</Text>
      <Text style={styles.searchEmptyHint}>
        Nie znaleziono notatek dla „{query}"
      </Text>
    </Animated.View>
  );
}

export default function DiaryScreen() {
  const { entries, reload, deleteEntry } = useDiaryEntries();
  const router = useRouter();

  //TODO:: Jak endpoint będzie to odkomentować GET /diary/{id}/summary
  //useDiarySummarySync(reload);

  // przeładowywuje wpisy za każdym razem gdy ekran staje się aktywny
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );
  const [searchQuery, setSearchQuery] = useState("");

  const todayDate = new Date().toLocaleDateString("pl-PL");
  const filtered = searchQuery.trim()
    ? entries
        .filter((e) => {
          const q = searchQuery.toLowerCase();
          return (
            e.title?.toLowerCase().includes(q) ||
            e.content?.toLowerCase().includes(q)
          );
        })
        .sort((a, b) => {
          const q = searchQuery.toLowerCase();
          const aTitle = a.title?.toLowerCase() ?? "";
          const bTitle = b.title?.toLowerCase() ?? "";
          const aContent = a.content?.toLowerCase() ?? "";
          const bContent = b.content?.toLowerCase() ?? "";

          // Priorytet 1: fraza na początku tytułu
          const aStartsTitle = aTitle.startsWith(q);
          const bStartsTitle = bTitle.startsWith(q);
          if (aStartsTitle && !bStartsTitle) return -1;
          if (!aStartsTitle && bStartsTitle) return 1;

          // Priorytet 2: fraza na początku treści
          const aStartsContent = aContent.startsWith(q);
          const bStartsContent = bContent.startsWith(q);
          if (aStartsContent && !bStartsContent) return -1;
          if (!aStartsContent && bStartsContent) return 1;

          // Priorytet 3: pozycja frazy w tytule
          const aIdx = aTitle.indexOf(q);
          const bIdx = bTitle.indexOf(q);
          if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;

          return 0;
        })
    : entries;
  const sortByNewest = (a: DiaryEntry, b: DiaryEntry) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();

  const today = filtered.filter((e) => e.date === todayDate).sort(sortByNewest);
  const earlier = filtered
    .filter((e) => e.date !== todayDate)
    .sort(sortByNewest);
  const isSearching = searchQuery.trim().length > 0;
  const noSearchResults = isSearching && filtered.length === 0;

  return (
    <LayoutContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <DiaryHeader />
          <AddEntryButton
            onPress={() => {
              router.push("/(tabs)/diary/note");
            }}
          />
        </View>

        <View style={styles.searchWrapper}>
          <DiarySearch value={searchQuery} onChange={setSearchQuery} />
        </View>

        {noSearchResults ? (
          <SearchEmpty query={searchQuery} />
        ) : (
          <>
            <View style={styles.section}>
              <DiaryEntriesSection
                title="Dzisiaj"
                entries={today}
                onDeleteEntry={deleteEntry}
                emptyPlaceholder={{
                  iconName: "journal-outline",
                  title: "Brak notatek na dziś",
                  hint: "Opisz jak minął Ci dzień",
                }}
              />
            </View>

            <View style={styles.section}>
              <DiaryEntriesSection
                title="Wcześniej"
                entries={earlier}
                onDeleteEntry={deleteEntry}
                emptyPlaceholder={{
                  iconName: "time-outline",
                  title: "Brak wcześniejszych notatek",
                  hint: "Twoje przeszłe wpisy pojawią się tutaj",
                }}
              />
            </View>
          </>
        )}
      </ScrollView>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    //krzystof bez//
    paddingHorizontal: 20,
    paddingBottom: 80, // место под плавающий tab bar
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },

  searchWrapper: {
    // marginBottom: spacing.xs,
  },

  section: {
    marginBottom: spacing.sm,
  },

  cloud: {
    width: 300,
    height: 300,
    alignSelf: "center",
    resizeMode: "contain",
  },
  searchEmpty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 6,
  },
  searchEmptyEmoji: {
    fontSize: 34,
    marginBottom: 4,
  },
  searchEmptyTitle: {
    ...typography.title,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  searchEmptyHint: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
  },
});
