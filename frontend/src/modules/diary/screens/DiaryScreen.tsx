import React from "react";
import { Image, ScrollView, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { useDiaryEntries } from "@/modules/diary/hooks/useDiaryEntries";

import DiaryHeader from "@/modules/diary/components/diaryScreen/DiaryHeader";
import DiarySection from "@/modules/diary/components/diaryScreen/DiarySection";
import DiarySearch from "@/modules/diary/components/diaryScreen/DiarySearch";
import AddEntryButton from "@/modules/diary/components/diaryScreen/AddEntryButton";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import { spacing } from "@/shared/theme/spacing";

export default function DiaryScreen() {
  const { entries } = useDiaryEntries();
  const router = useRouter();

  const today = entries.filter((e) => e.section === "today");
  const earlier = entries.filter((e) => e.section === "earlier");

  return (
    <LayoutContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require("../../../../assets/images/cloud.png")}
          style={styles.cloud}
        />

        <View style={styles.headerRow}>
          <DiaryHeader />
          <AddEntryButton
            onPress={() => {
              router.push("/(tabs)/diary/note");
            }}
          />
        </View>

        <View style={styles.searchWrapper}>
          <DiarySearch />
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
    paddingTop: 60, // немного воздуха сверху
    paddingHorizontal: 20,
    paddingBottom: 80, // место под плавающий tab bar
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  searchWrapper: {
    marginBottom: spacing.sm,
  },

  section: {
    marginBottom: spacing.md,
  },

  cloud: {
    width: 320,
    height: 320,
    alignSelf: "center",
    marginTop: -65,
    resizeMode: "contain",
  },
});
