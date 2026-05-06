import LayoutContainer from "@/shared/layout/LayoutContainer";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";
import { cardStyles } from "@/shared/theme/styles";
import { typography } from "@/shared/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PsychologistCard from "../components/PsychologistCard";
import { psychologists } from "../data/psychologists";
import { Visit } from "../../visits/visits.types";
import { formatVisitDate, getVisitInitials } from "@/shared/utils/visitUtils";
import { useVisitStore } from "../../../services/store/useVisitStore";

type Section = "psycholodzy" | "wizyty";

const TABS: { key: Section; label: string }[] = [
  { key: "psycholodzy", label: "Specjaliści" },
  { key: "wizyty", label: "Moje wizyty" },
];

export default function PsychologistsListScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("psycholodzy");

  const visits = useVisitStore((s) => s.visits);
  const cancelVisit = useVisitStore((s) => s.cancelVisit);

  const upcoming = visits.filter((v) => v.status === "upcoming");
  const past = visits.filter((v) => v.status === "completed" || v.status === "cancelled");

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(screenSlide, { toValue: 0, duration: 300, useNativeDriver: true }),
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
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
          <View style={styles.headerCenter}>
            <View style={styles.proBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#fff" />
              <Text style={styles.proBadgeText}>PREMIUM</Text>
            </View>
            <Text style={styles.headerTitle}>Psycholodzy</Text>
            <Text style={styles.headerSub}>Certyfikowani specjaliści online</Text>
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

        {/* Section tab bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <Pressable key={tab.key} style={styles.tabBtn} onPress={() => setActiveSection(tab.key)}>
              <View style={styles.tabBtnInner}>
                <Text style={[styles.tabLabel, activeSection === tab.key && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {tab.key === "wizyty" && upcoming.length > 0 && (
                  <View style={[styles.tabBadge, activeSection === "wizyty" && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, activeSection === "wizyty" && styles.tabBadgeTextActive]}>
                      {upcoming.length}
                    </Text>
                  </View>
                )}
              </View>
              {activeSection === tab.key && <View style={styles.tabIndicator} />}
            </Pressable>
          ))}
        </View>

        {/* ── SPECJALIŚCI ── */}
        {activeSection === "psycholodzy" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            <Text style={styles.resultCount}>{psychologists.length} specjalistów</Text>
            {psychologists.map((p) => (
              <PsychologistCard
                key={p.id}
                psychologist={p}
                onPress={() => router.push(`/psychologists/${p.id}`)}
              />
            ))}
            <View style={styles.bottomNote}>
              <Ionicons name="information-circle-outline" size={14} color={colors.text.quaternary} />
              <Text style={styles.bottomNoteText}>
                Wszystkie sesje są szyfrowane i w pełni poufne
              </Text>
            </View>
          </ScrollView>
        )}

        {/* ── WIZYTY ── */}
        {activeSection === "wizyty" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.visitsContent}
          >
            {visits.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Ionicons name="calendar-outline" size={52} color={colors.text.quaternary} />
                <Text style={styles.emptyTitle}>Brak wizyt</Text>
                <Text style={styles.emptySub}>Umów pierwszą wizytę ze specjalistą</Text>
                <Pressable style={styles.emptyBtn} onPress={() => setActiveSection("psycholodzy")}>
                  <Ionicons name="people-outline" size={15} color="#fff" />
                  <Text style={styles.emptyBtnText}>Znajdź specjalistę</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionDot} />
                      <Text style={styles.sectionTitle}>Nadchodzące</Text>
                      <View style={styles.sectionBadge}>
                        <Text style={styles.sectionBadgeText}>{upcoming.length}</Text>
                      </View>
                    </View>
                    {upcoming.map((v) => <VisitCard key={v.id} visit={v} onCancel={() => cancelVisit(v.id)} />)}
                  </>
                )}
                {past.length > 0 && (
                  <>
                    <View style={[styles.sectionHeader, upcoming.length > 0 && { marginTop: spacing.md }]}>
                      <Ionicons name="time-outline" size={13} color={colors.text.secondary} />
                      <Text style={styles.sectionTitle}>Historia</Text>
                    </View>
                    {past.map((v) => <VisitCard key={v.id} visit={v} />)}
                  </>
                )}
              </>
            )}
          </ScrollView>
        )}
      </Animated.View>
    </LayoutContainer>
  );
}

// ─── VisitCard ────────────────────────────────────────────────────────────────

function VisitCard({ visit, onCancel }: { visit: Visit; onCancel?: () => void }) {
  const initials = getVisitInitials(visit.psychologistName);
  const isUpcoming = visit.status === "upcoming";
  const isCancelled = visit.status === "cancelled";

  const handleCancel = () => {
    Alert.alert(
      "Odwołaj wizytę",
      `Czy na pewno chcesz odwołać wizytę z ${visit.psychologistTitle} ${visit.psychologistName}?`,
      [
        { text: "Nie", style: "cancel" },
        { text: "Odwołaj", style: "destructive", onPress: () => onCancel?.() },
      ]
    );
  };

  return (
    <View style={[cardStyles.card, styles.visitCard]}>
      {/* Top */}
      <View style={styles.visitTop}>
        <View style={[styles.visitAvatar, { backgroundColor: visit.psychologistPhoto ? "transparent" : visit.psychologistAvatarColor }]}>
          {visit.psychologistPhoto
            ? <Image source={visit.psychologistPhoto} style={styles.visitAvatarImg} />
            : <Text style={styles.visitInitials}>{initials}</Text>
          }
        </View>
        <View style={styles.visitInfo}>
          <Text style={styles.visitName}>
            {visit.psychologistTitle} {visit.psychologistName}
          </Text>
          <Text style={styles.visitSpecialty} numberOfLines={1}>
            {visit.psychologistSpecialty}
          </Text>
          <View style={styles.visitStatusRow}>
            {isUpcoming && (
              <View style={styles.pillUpcoming}>
                <View style={styles.greenDot} />
                <Text style={styles.pillUpcomingText}>Zaplanowana</Text>
              </View>
            )}
            {visit.status === "completed" && (
              <View style={styles.pillCompleted}>
                <Ionicons name="checkmark" size={11} color="#4a9c5d" />
                <Text style={styles.pillCompletedText}>Odbyta</Text>
              </View>
            )}
            {isCancelled && (
              <View style={styles.pillCancelled}>
                <Text style={styles.pillCancelledText}>Odwołana</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.visitDivider} />

      {/* Details */}
      <View style={styles.visitDetails}>
        <DetailItem icon="calendar-outline" text={formatVisitDate(visit.date)} />
        <DetailItem icon="time-outline" text={`${visit.time} · ${visit.duration} min`} />
        <DetailItem icon="videocam-outline" text={visit.format} />
        <DetailItem icon="cash-outline" text={`${visit.price} zł`} />
      </View>

      <Text style={styles.visitSessionType}>
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
      <Ionicons name={icon} size={13} color={colors.text.secondary} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

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
  headerCenter: { flex: 1, alignItems: "center", marginRight: 30, marginBottom: 10 },
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
  proBadgeText: { fontSize: 10, fontWeight: "800", color: "#fff", letterSpacing: 1 },
  headerTitle: { ...typography.heading1, color: colors.text.primary, fontWeight: "700" },
  headerSub: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },

  trustStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: "rgba(55,90,133,0.07)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1, justifyContent: "center" },
  trustLabel: { fontSize: 11, fontWeight: "600", color: colors.text.primary },
  stripDivider: { width: 1, height: 16, backgroundColor: "rgba(55,90,133,0.15)" },

  // ── Tab bar ──
  tabBar: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(55,90,133,0.1)",
    marginBottom: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  tabBtnInner: { flexDirection: "row", alignItems: "center", gap: 6 },
  tabLabel: { fontSize: 14, fontWeight: "600", color: colors.text.secondary },
  tabLabelActive: { color: colors.text.primary, fontWeight: "700" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.text.primary,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(55,90,133,0.15)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  tabBadgeActive: { backgroundColor: colors.text.primary },
  tabBadgeText: { fontSize: 10, fontWeight: "700", color: colors.text.secondary },
  tabBadgeTextActive: { color: "#fff" },

  // ── List ──
  listContent: { alignItems: "center", paddingBottom: 110 },
  resultCount: {
    ...typography.caption,
    color: colors.text.secondary,
    alignSelf: "flex-start",
    marginLeft: "4%",
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  bottomNote: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: spacing.md, opacity: 0.6 },
  bottomNoteText: { fontSize: 11, color: colors.text.secondary },

  // ── Visits ──
  visitsContent: { paddingHorizontal: spacing.md, paddingBottom: 110, gap: spacing.sm },

  emptyWrap: { alignItems: "center", paddingTop: 60, gap: spacing.sm },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: colors.text.secondary, marginTop: spacing.sm },
  emptySub: { fontSize: 13, color: colors.text.quaternary, textAlign: "center" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: colors.text.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
  },
  emptyBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#6FAE7A" },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: colors.text.primary,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  sectionBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },

  visitCard: { padding: spacing.md },
  visitTop: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  visitAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  visitAvatarImg: { width: 52, height: 52, borderRadius: 16 },
  visitInitials: { fontSize: 16, fontWeight: "700", color: colors.text.primary },
  visitInfo: { flex: 1, gap: 3 },
  visitName: { ...typography.titleSmall, fontWeight: "700", color: colors.text.primary },
  visitSpecialty: { fontSize: 12, color: colors.text.secondary },
  visitStatusRow: { marginTop: 4 },

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
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6FAE7A" },
  pillUpcomingText: { fontSize: 11, fontWeight: "700", color: "#4a8a55" },
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
  pillCompletedText: { fontSize: 11, fontWeight: "600", color: "#4a9c5d" },
  pillCancelled: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(192,80,77,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  pillCancelledText: { fontSize: 11, fontWeight: "600", color: "#c0504d" },

  visitDivider: { height: 1, backgroundColor: "rgba(55,90,133,0.08)", marginVertical: spacing.sm },
  visitDetails: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 5, width: "46%" },
  detailText: { fontSize: 12, color: colors.text.secondary, flexShrink: 1 },
  visitSessionType: { fontSize: 11, color: colors.text.quaternary, fontStyle: "italic", marginTop: spacing.sm },
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
  cancelBtnText: { fontSize: 13, fontWeight: "600", color: "#c0504d" },
});
