import LayoutContainer from "@/shared/layout/LayoutContainer";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";
import { cardStyles } from "@/shared/theme/styles";
import { typography } from "@/shared/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { visits } from "../data/visits";
import { Visit } from "../visits.types";
import { formatVisitDate, getVisitInitials } from "@/shared/utils/visitUtils";

type Tab = "upcoming" | "past";

export default function VisitsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const upcoming = visits.filter((v) => v.status === "upcoming");
  const past = visits.filter((v) => v.status === "completed" || v.status === "cancelled");
  const list = activeTab === "upcoming" ? upcoming : past;

  return (
    <LayoutContainer>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Moje wizyty</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab bar — underline style */}
      <View style={styles.tabBar}>
        <Pressable style={styles.tabBtn} onPress={() => setActiveTab("upcoming")}>
          <View style={styles.tabBtnInner}>
            <Text style={[styles.tabLabel, activeTab === "upcoming" && styles.tabLabelActive]}>
              Nadchodzące
            </Text>
            {upcoming.length > 0 && (
              <View style={[styles.badge, activeTab === "upcoming" && styles.badgeActive]}>
                <Text style={[styles.badgeText, activeTab === "upcoming" && styles.badgeTextActive]}>
                  {upcoming.length}
                </Text>
              </View>
            )}
          </View>
          {activeTab === "upcoming" && <View style={styles.tabIndicator} />}
        </Pressable>

        <Pressable style={styles.tabBtn} onPress={() => setActiveTab("past")}>
          <View style={styles.tabBtnInner}>
            <Text style={[styles.tabLabel, activeTab === "past" && styles.tabLabelActive]}>
              Przeszłe
            </Text>
          </View>
          {activeTab === "past" && <View style={styles.tabIndicator} />}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          list.map((visit) => <VisitCard key={visit.id} visit={visit} />)
        )}
      </ScrollView>
    </LayoutContainer>
  );
}

function VisitCard({ visit }: { visit: Visit }) {
  const initials = getVisitInitials(visit.psychologistName);
  const isUpcoming = visit.status === "upcoming";
  const isCancelled = visit.status === "cancelled";

  const handleCancel = () => {
    Alert.alert(
      "Odwołaj wizytę",
      `Czy na pewno chcesz odwołać wizytę z ${visit.psychologistTitle} ${visit.psychologistName}?`,
      [
        { text: "Nie", style: "cancel" },
        { text: "Odwołaj", style: "destructive", onPress: () => {} },
      ]
    );
  };

  return (
    <View style={[cardStyles.card, styles.card]}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: visit.psychologistPhoto ? "transparent" : visit.psychologistAvatarColor },
          ]}
        >
          {visit.psychologistPhoto ? (
            <Image source={visit.psychologistPhoto} style={styles.avatarImg} />
          ) : (
            <Text style={styles.initials}>{initials}</Text>
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.psychName}>
            {visit.psychologistTitle} {visit.psychologistName}
          </Text>
          <Text style={styles.psychSpecialty} numberOfLines={1}>
            {visit.psychologistSpecialty}
          </Text>

          <View style={styles.statusRow}>
            {isUpcoming && (
              <View style={styles.pillUpcoming}>
                <View style={styles.greenDot} />
                <Text style={styles.pillTextUpcoming}>Zaplanowana</Text>
              </View>
            )}
            {isCancelled && (
              <View style={styles.pillCancelled}>
                <Text style={styles.pillTextCancelled}>Odwołana</Text>
              </View>
            )}
            {visit.status === "completed" && (
              <View style={styles.pillCompleted}>
                <Ionicons name="checkmark" size={11} color="#4a9c5d" />
                <Text style={styles.pillTextCompleted}>Odbyta</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Details */}
      <View style={styles.detailsGrid}>
        <DetailItem icon="calendar-outline" text={formatVisitDate(visit.date)} />
        <DetailItem icon="time-outline" text={`${visit.time} · ${visit.duration} min`} />
        <DetailItem icon="videocam-outline" text={visit.format} />
        <DetailItem icon="cash-outline" text={`${visit.price} zł`} />
      </View>

      <Text style={styles.sessionTypeText}>
        {visit.sessionType === "first" ? "Pierwsza wizyta" : "Kontynuacja terapii"}
      </Text>

      {isUpcoming && (
        <Pressable style={styles.cancelBtn} onPress={handleCancel}>
          <Ionicons name="close-circle-outline" size={15} color="#c0504d" />
          <Text style={styles.cancelBtnText}>Odwołaj wizytę</Text>
        </Pressable>
      )}
    </View>
  );
}

function DetailItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon} size={14} color={colors.text.secondary} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons
        name={tab === "upcoming" ? "calendar-outline" : "time-outline"}
        size={48}
        color={colors.text.quaternary}
      />
      <Text style={styles.emptyTitle}>
        {tab === "upcoming" ? "Brak nadchodzących wizyt" : "Brak przeszłych wizyt"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {tab === "upcoming"
          ? "Umów pierwszą wizytę z psychologiem"
          : "Historia wizyt pojawi się tutaj"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    ...typography.title,
    fontWeight: "700",
    color: colors.text.primary,
  },

  // ── Tab bar ──
  tabBar: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(55,90,133,0.1)",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    position: "relative",
  },
  tabBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  tabLabelActive: {
    color: colors.text.primary,
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.text.primary,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(55,90,133,0.15)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeActive: {
    backgroundColor: colors.text.primary,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  badgeTextActive: {
    color: "#fff",
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },

  // ── Visit card ──
  card: {
    padding: spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  avatarImg: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  initials: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  psychName: {
    ...typography.titleSmall,
    fontWeight: "700",
    color: colors.text.primary,
  },
  psychSpecialty: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  statusRow: {
    marginTop: 4,
  },
  pillUpcoming: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(111,174,122,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6FAE7A",
  },
  pillTextUpcoming: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4a8a55",
  },
  pillCompleted: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(74,156,93,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  pillTextCompleted: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4a9c5d",
  },
  pillCancelled: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(192,80,77,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pillTextCancelled: {
    fontSize: 11,
    fontWeight: "600",
    color: "#c0504d",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(55,90,133,0.08)",
    marginVertical: spacing.sm,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: "46%",
  },
  detailText: {
    fontSize: 12,
    color: colors.text.secondary,
    flexShrink: 1,
  },
  sessionTypeText: {
    fontSize: 11,
    color: colors.text.quaternary,
    fontStyle: "italic",
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(192,80,77,0.3)",
    backgroundColor: "rgba(192,80,77,0.05)",
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#c0504d",
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.titleSmall,
    fontWeight: "700",
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.text.quaternary,
    textAlign: "center",
  },
});
