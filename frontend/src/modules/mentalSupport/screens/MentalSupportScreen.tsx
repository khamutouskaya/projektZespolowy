import React from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";

import Quote from "@/modules/mentalSupport/components/mentSuppScreen/Quote";
import LayoutContainer from "@/shared/layout/LayoutContainer";
import RecentVideos from "../components/mentSuppScreen/RecentVideos";
import PracticeCard from "../components/mentSuppScreen/PracticeCard";

import { spacing } from "@/shared/theme/spacing";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";

import { useRouter } from "expo-router";

export default function MentalSupportScreen() {
  const router = useRouter();
  const practices = [
    { id: "1", title: "oddechowe" },
    { id: "2", title: "medytacje" },
    { id: "3", title: "dzwiek natury" },
    { id: "4", title: "trening" },
  ];

  return (
    <LayoutContainer>
      <View style={styles.container}>
        <View style={styles.quote}>
          <Quote />
        </View>

        <Text style={styles.sectionTitle}>Niedawno oglądane:</Text>
      </View>

      <View style={styles.video}>
        <RecentVideos />
      </View>

      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Praktyki:</Text>

        <View style={styles.grid}>
          <PracticeCard
            title="Oddechowe"
            image={require("../../../../assets/mentalSupport/breathing.jpg")}
            onPress={() => router.push("/(tabs)/mentalSupport/breathing")}
          />

          <PracticeCard
            title="Medytacje"
            image={require("../../../../assets/mentalSupport/meditation.jpg")}
            onPress={() => router.push("/(tabs)/mentalSupport/meditation")}
          />

          <PracticeCard
            title="Dźwięki natury"
            image={require("../../../../assets/mentalSupport/nature.jpg")}
            onPress={() => router.push("/(tabs)/mentalSupport/nature")}
          />

          <PracticeCard
            title="Trening"
            image={require("../../../../assets/mentalSupport/training.jpg")}
            onPress={() => router.push("/(tabs)/mentalSupport/training")}
          />
        </View>
      </View>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    //paddingLeft: 20,
    paddingHorizontal: 20,
    //paddingBottom: 80, // место под плавающий tab bar
    //flex: 1,
  },

  sectionTitle: {
    ...typography.title,
    color: colors.text.tertiary,
    paddingLeft: spacing.xs,
    marginBottom: spacing.md,
    //borderWidth: 1,
  },

  quote: {
    padding: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    //marginRight: spacing.lg,
    shadowColor: colors.shadow.primary,
  },

  video: {
    marginBottom: spacing.xxl,
    //borderWidth: 1,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    //borderWidth: 1,
    // paddingHorizontal: 20,
    //marginRight: spacing.md,
    //marginLeft: spacing.md,
  },

  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
