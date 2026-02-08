import React from "react";
import {
  Image,
  View,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useDiaryEntries } from "../hooks/useDiaryEntries";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DiaryHeader from "../components/DiaryHeader";
import DiarySection from "../components/DiarySection";
import DiarySearch from "../components/DiarySearch";

export default function DiaryScreen() {
  const { entries } = useDiaryEntries();

  const today = entries.filter((e) => e.section === "today");
  const earlier = entries.filter((e) => e.section === "earlier");

  return (
    <ImageBackground
      source={require("../../../../assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../../../assets/images/cloud.png")}
            style={styles.cloud}
          />

          <DiaryHeader />

          <DiarySearch />

          <DiarySection title="Dzisiaj" entries={today} />
          <DiarySection title="Wcześniej" entries={earlier} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 60, // немного воздуха сверху
    paddingHorizontal: 5,
    paddingBottom: 80, // место под плавающий tab bar
  },

  cloud: {
    width: 320,
    height: 320,
    alignSelf: "center",
    marginTop: -40, // 👈 поднимаем
    marginBottom: 0,
    resizeMode: "contain",
  },
});
