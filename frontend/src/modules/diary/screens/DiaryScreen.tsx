import React from "react";
import { Image, ScrollView, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { useDiaryEntries } from "@/modules/diary/hooks/useDiaryEntries";

import DiaryHeader from "@/modules/diary/components/diaryScreen/DiaryHeader";
import DiaryEntriesSection from "@/modules/diary/components/diaryScreen/DiaryEntriesSection";
import { useDiarySummarySync } from "@/modules/diary/hooks/useDiarySummarySync";
import DiarySearch from "@/modules/diary/components/diaryScreen/DiarySearch";
import AddEntryButton from "@/modules/diary/components/diaryScreen/AddEntryButton";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import { spacing } from "@/shared/theme/spacing";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { diarySyncService } from "../services/diarySyncService";
import { useAuthStore } from "@/services/store/useAuthStore";
import NetInfo from "@react-native-community/netinfo";

export default function DiaryScreen() {
  const { entries, reload, deleteEntry } = useDiaryEntries();
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id);

  useDiarySummarySync(reload);
  useFocusEffect(
    useCallback(() => {
      const sync = async () => {
        if (!userId) return;

        const netState = await NetInfo.fetch();
        if (netState.isConnected) {
          await diarySyncService.fullSync(userId);
        }
        reload();
      };
      sync();
    }, [userId, reload]),
  );
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
  const today = filtered.filter((e) => e.date === todayDate);
  const earlier = filtered.filter((e) => e.date !== todayDate);
  const DiarySection = ({
    title,
    entries: sectionEntries,
  }: {
    title: string;
    entries: typeof entries;
  }) => (
    <DiaryEntriesSection
      title={title}
      entries={sectionEntries}
      onDeleteEntry={deleteEntry}
    />
  );

  return (
    <LayoutContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* <Image
          source={require("../../../../assets/images/cloud.png")}
          style={styles.cloud}
        /> */}

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

        <View style={styles.section}>
          <DiarySection title="Dzisiaj" entries={today} />
        </View>

        <View style={styles.section}>
          <DiarySection title="Wcześniej" entries={earlier} />
        </View>
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
    //marginTop: -65,
    resizeMode: "contain",
  },
});
