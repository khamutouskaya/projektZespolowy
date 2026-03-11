import React from "react";
import { Image, ScrollView, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { useDiaryEntries } from "@/modules/diary/hooks/useDiaryEntries";

import DiaryHeader from "@/modules/diary/components/DiaryHeader";
import DiarySection from "@/modules/diary/components/DiarySection";
import DiarySearch from "@/modules/diary/components/DiarySearch";
import AddEntryButton from "@/modules/diary/components/AddEntryButton";
export default function DiaryScreen() {
  const { entries } = useDiaryEntries();
  const router = useRouter();

  const today = entries.filter((e) => e.section === "today");
  const earlier = entries.filter((e) => e.section === "earlier");

  return (
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
            router.push("/(tabs)/home");
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
    marginBottom: 16,
  },

  searchWrapper: {
    marginBottom: 0,
  },

  buttonWrapper: {
    marginBottom: 20,
  },

  section: {
    marginBottom: 10,
  },

  cloud: {
    width: 320,
    height: 320,
    alignSelf: "center",
    marginTop: -40, // 👈 поднимаем
    marginBottom: 0,
    resizeMode: "contain",

    shadowColor: "#686868",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
