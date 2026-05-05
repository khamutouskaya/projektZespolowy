import LayoutContainer from "@/shared/layout/LayoutContainer";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";
import { typography } from "@/shared/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PsychologistCard from "../components/PsychologistCard";
import { psychologists } from "../data/psychologists";
import { FilterCategory } from "../psychologists.types";

const FILTERS: { key: FilterCategory; label: string }[] = [
  { key: "Wszyscy", label: "Wszyscy" },
  { key: "CBT", label: "CBT" },
  { key: "Trauma", label: "Trauma" },
  { key: "Relacje", label: "Relacje" },
  { key: "Dzieci", label: "Dzieci" },
  { key: "Biznes", label: "Biznes" },
];

export default function PsychologistsListScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("Wszyscy");

  const filtered =
    activeFilter === "Wszyscy"
      ? psychologists
      : psychologists.filter((p) => p.filterCategory === activeFilter);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(screenSlide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LayoutContainer>
      <Animated.View
        style={[
          styles.root,
          { opacity: screenOpacity, transform: [{ translateY: screenSlide }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text.primary}
            />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.proBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#fff" />
              <Text style={styles.proBadgeText}>PREMIUM</Text>
            </View>
            <Text style={styles.headerTitle}>Psycholodzy</Text>
            <Text style={styles.headerSub}>
              Certyfikowani specjaliści online
            </Text>
          </View>
        </View>

        {/* Trust strip */}
        <View style={styles.trustStrip}>
          <TrustItem icon="shield-checkmark-outline" label="Weryfikowani" />
          <View style={styles.stripDivider} />
          <TrustItem icon="videocam-outline" label="Sesje online" />
          <View style={styles.stripDivider} />
          <TrustItem icon="lock-closed-outline" label="Poufność" />
        </View>

        {/* List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <Text style={styles.resultCount}>{filtered.length} specjalistów</Text>

          {filtered.map((p) => (
            <PsychologistCard
              key={p.id}
              psychologist={p}
              onPress={() => router.push(`/psychologists/${p.id}`)}
            />
          ))}

          <View style={styles.bottomNote}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={colors.text.quaternary}
            />
            <Text style={styles.bottomNoteText}>
              Wszystkie sesje są szyfrowane i w pełni poufne
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </LayoutContainer>
  );
}

function TrustItem({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.trustItem}>
      <Ionicons name={icon} size={14} color={colors.text.primary} />
      <Text style={styles.trustLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginTop: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginRight: 30,
    marginBottom: 10,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.text.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
  headerTitle: {
    ...typography.heading1,
    color: colors.text.primary,
    fontWeight: "700",
  },
  headerSub: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  trustStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: "rgba(55,90,133,0.07)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
    justifyContent: "center",
  },
  trustLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.primary,
  },
  stripDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(55,90,133,0.15)",
  },
  filtersScroll: {
    marginBottom: spacing.md,
  },
  filtersRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(55,90,133,0.12)",
  },
  filterChipActive: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: "#fff",
  },
  listContent: {
    alignItems: "center",
    paddingBottom: 110,
  },
  resultCount: {
    ...typography.caption,
    color: colors.text.secondary,
    alignSelf: "flex-start",
    marginLeft: "4%",
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  bottomNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: spacing.md,
    opacity: 0.6,
  },
  bottomNoteText: {
    fontSize: 11,
    color: colors.text.secondary,
  },
});
