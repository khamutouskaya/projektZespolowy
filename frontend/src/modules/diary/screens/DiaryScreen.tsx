import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";

import { useDiaryEntries } from "@/modules/diary/hooks/useDiaryEntries";

import AddEntryButton from "@/modules/diary/components/diaryScreen/AddEntryButton";
import DiaryHeader from "@/modules/diary/components/diaryScreen/DiaryHeader";
import DiarySearch from "@/modules/diary/components/diaryScreen/DiarySearch";
import DiarySection from "@/modules/diary/components/diaryScreen/DiarySection";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import { spacing } from "@/shared/theme/spacing";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function DiaryScreen() {
  const { entries, reload } = useDiaryEntries();
  const router = useRouter();

  // przeładowywuje wpisy za każdym razem gdy ekran staje się aktywny
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const today = entries.filter((e) => e.section === "today");
  const earlier = entries.filter((e) => e.section === "earlier");

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
