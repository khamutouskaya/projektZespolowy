import React from "react";
import {
  Image,
  ScrollView,
  View,
  ImageBackground,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useDiaryEntries } from "../hooks/useDiaryEntries";
//import { useSafeAreaInsets } from "react-native-safe-area-context";

import DiaryHeader from "../components/DiaryHeader";
import DiarySection from "../components/DiarySection";
import DiarySearch from "../components/DiarySearch";
import AddEntryButton from "../components/AddEntryButton";

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

          <View style={styles.headerRow}>
            <DiaryHeader />
            <AddEntryButton
              onPress={() => {
                console.log("Add entry");
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
