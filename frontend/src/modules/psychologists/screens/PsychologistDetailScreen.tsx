import LayoutContainer from "@/shared/layout/LayoutContainer";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";
import { cardStyles } from "@/shared/theme/styles";
import { typography } from "@/shared/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { psychologists } from "../data/psychologists";
import { Visit } from "../../visits/visits.types";
import { formatVisitDate, MONTHS_FULL } from "@/shared/utils/visitUtils";
import { useVisitStore } from "../../../services/store/useVisitStore";

const DAYS_PL = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
const MONTHS_PL = [
  "sty",
  "lut",
  "mar",
  "kwi",
  "maj",
  "cze",
  "lip",
  "sie",
  "wrz",
  "paź",
  "lis",
  "gru",
];

const MORNING_SLOTS = ["8:00", "9:00", "10:00", "11:00"];
const AFTERNOON_SLOTS = ["13:00", "14:00", "15:00", "16:00", "17:00"];
const EVENING_SLOTS = ["18:00", "19:00", "20:00"];

const SESSION_TYPES = [
  { id: "first", label: "Pierwsza wizyta", desc: "Konsultacja diagnostyczna" },
  { id: "follow", label: "Kontynuacja", desc: "Sesja terapeutyczna" },
];

type Tab = "profil" | "terminy" | "opinie" | "wizyty";

interface SlotInfo {
  time: string;
  available: boolean;
}

function getSlotsForDay(psychId: string, dayOffset: number) {
  const seed = parseInt(psychId) * 13 + dayOffset * 7;
  const isAvail = (i: number) => (seed + i * 3 + dayOffset) % 4 !== 0;
  return {
    morning: MORNING_SLOTS.map((t, i) => ({
      time: t,
      available: dayOffset === 0 ? i >= 2 : isAvail(i),
    })),
    afternoon: AFTERNOON_SLOTS.map((t, i) => ({
      time: t,
      available: isAvail(i + 4),
    })),
    evening: EVENING_SLOTS.map((t, i) => ({
      time: t,
      available: isAvail(i + 9),
    })),
  };
}

export default function PsychologistDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const psychologist = psychologists.find((p) => p.id === id);

  const [activeTab, setActiveTab] = useState<Tab>("profil");
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState("first");
  const [showConfirm, setShowConfirm] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  const allVisits = useVisitStore((s) => s.visits);
  const addVisit = useVisitStore((s) => s.addVisit);
  const cancelVisit = useVisitStore((s) => s.cancelVisit);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate, activeTab]);

  if (!psychologist) {
    return (
      <LayoutContainer>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Nie znaleziono specjalisty</Text>
        </View>
      </LayoutContainer>
    );
  }

  const {
    firstName,
    lastName,
    title,
    specialty,
    bio,
    approach,
    experience,
    sessionsCount,
    rating,
    reviewsCount,
    pricePerSession,
    sessionDuration,
    sessionFormats,
    languages,
    specializations,
    certifications,
    education,
    avatarColor,
    photo,
    availableToday,
    nextAvailable,
    reviews,
  } = psychologist;

  const initials = `${firstName[0]}${lastName[0]}`;
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const slots = getSlotsForDay(id!, selectedDate);

  const psychVisits = allVisits.filter((v: Visit) => v.psychologistId === id);
  const psychUpcoming = psychVisits.filter((v: Visit) => v.status === "upcoming");
  const psychPast = psychVisits.filter((v: Visit) => v.status === "completed" || v.status === "cancelled");

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return {
      star,
      count,
      pct: reviews.length ? (count / reviews.length) * 100 : 0,
    };
  });

  const selectedDay = weekDays[selectedDate];
  const selectedDayLabel = selectedDay
    ? `${selectedDate === 0 ? "Dziś" : DAYS_PL[selectedDay.getDay()]}, ${selectedDay.getDate()} ${MONTHS_PL[selectedDay.getMonth()]}`
    : "";

  const handleBook = () => {
    if (!selectedSlot) return;
    Animated.sequence([
      Animated.spring(ctaScale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 60,
        bounciness: 0,
      }),
      Animated.spring(ctaScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }),
    ]).start();
    setShowConfirm(true);
  };

  return (
    <>
      <LayoutContainer>
        <Animated.View style={[{ flex: 1 }, { opacity: screenOpacity }]}>
          {/* Back button */}
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text.primary}
            />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ── HERO ── */}
            <View style={styles.hero}>
              <View style={styles.premiumBadge}>
                <Ionicons name="shield-checkmark" size={11} color="#fff" />
                <Text style={styles.premiumText}>PREMIUM · ZWERYFIKOWANY</Text>
              </View>

              {/* Avatar with ring */}
              <View style={styles.avatarRing}>
                <View
                  style={[styles.avatarWrap, { backgroundColor: photo ? "transparent" : avatarColor }]}
                >
                  {photo ? (
                    <Image source={photo} style={styles.avatarPhoto} />
                  ) : (
                    <Text style={styles.initials}>{initials}</Text>
                  )}
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={26} color="#4a9c5d" />
                </View>
              </View>

              <Text style={styles.heroName}>
                {title} {firstName} {lastName}
              </Text>
              <Text style={styles.heroSpecialty}>{specialty}</Text>

              {/* Language pills */}
              <View style={styles.langRow}>
                {languages.map((lang) => (
                  <View key={lang} style={styles.langPill}>
                    <Ionicons
                      name="globe-outline"
                      size={11}
                      color={colors.text.secondary}
                    />
                    <Text style={styles.langText}>{lang}</Text>
                  </View>
                ))}
              </View>

              {/* Rating */}
              <View style={styles.ratingRow}>
                <View style={styles.starsRow}>
                  {stars.map((filled, i) => (
                    <Ionicons
                      key={i}
                      name={filled ? "star" : "star-outline"}
                      size={16}
                      color={filled ? "#f5a623" : colors.text.quaternary}
                    />
                  ))}
                </View>
                <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({reviewsCount} opinii)</Text>
              </View>

              {/* Availability */}
              <View style={styles.availRow}>
                {availableToday ? (
                  <View style={styles.availPill}>
                    <View style={styles.greenDot} />
                    <Text style={styles.availText}>
                      Dostępny/a dziś · {nextAvailable}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.availPillGray}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={colors.text.secondary}
                    />
                    <Text style={styles.availTextGray}>
                      Następny termin: {nextAvailable}
                    </Text>
                  </View>
                )}
              </View>

              {/* 2×2 stats grid */}
              <View style={styles.statsGrid}>
                <StatCard
                  icon="cash-outline"
                  value={`${pricePerSession} zł`}
                  label="za sesję"
                />
                <StatCard
                  icon="time-outline"
                  value={`${sessionDuration} min`}
                  label="czas sesji"
                />
                <StatCard
                  icon="videocam-outline"
                  value={sessionFormats.join(" / ")}
                  label="forma"
                />
                <StatCard
                  icon="briefcase-outline"
                  value={`${experience} lat`}
                  label="doświadczenia"
                />
              </View>
            </View>

            {/* ── TAB BAR (underline style) ── */}
            <View style={styles.tabBar}>
              {(["profil", "terminy", "opinie", "wizyty"] as Tab[]).map((tab) => (
                <Pressable
                  key={tab}
                  style={styles.tabBtn}
                  onPress={() => setActiveTab(tab)}
                >
                  <View style={styles.tabBtnInner}>
                    <Text
                      style={[
                        styles.tabLabel,
                        activeTab === tab && styles.tabLabelActive,
                      ]}
                    >
                      {tab === "profil"
                        ? "Profil"
                        : tab === "terminy"
                          ? "Terminy"
                          : tab === "opinie"
                            ? "Opinie"
                            : "Wizyty"}
                    </Text>
                    {tab === "wizyty" && psychVisits.length > 0 && (
                      <View style={[styles.tabBadge, activeTab === "wizyty" && styles.tabBadgeActive]}>
                        <Text style={[styles.tabBadgeText, activeTab === "wizyty" && styles.tabBadgeTextActive]}>
                          {psychVisits.length}
                        </Text>
                      </View>
                    )}
                  </View>
                  {activeTab === tab && <View style={styles.tabIndicator} />}
                </Pressable>
              ))}
            </View>

            {/* ── PROFIL ── */}
            {activeTab === "profil" && (
              <View style={styles.tabContent}>
                {/* O mnie */}
                <View style={[cardStyles.card, styles.card]}>
                  <SectionHeader icon="person-circle-outline" title="O mnie" />
                  <Text
                    style={styles.bodyText}
                    numberOfLines={bioExpanded ? undefined : 4}
                  >
                    {bio}
                  </Text>
                  <Pressable
                    onPress={() => setBioExpanded(!bioExpanded)}
                    style={styles.expandBtn}
                  >
                    <Text style={styles.expandText}>
                      {bioExpanded ? "Zwiń" : "Czytaj więcej"}
                    </Text>
                    <Ionicons
                      name={bioExpanded ? "chevron-up" : "chevron-down"}
                      size={13}
                      color={colors.text.primary}
                    />
                  </Pressable>
                </View>

                {/* Pierwsza sesja */}
                <View style={styles.firstSessionCard}>
                  <View style={styles.firstSessionHeader}>
                    <View style={styles.firstSessionIcon}>
                      <Ionicons
                        name="sparkles-outline"
                        size={18}
                        color={colors.text.primary}
                      />
                    </View>
                    <Text style={styles.firstSessionTitle}>
                      Czego się spodziewać?
                    </Text>
                  </View>
                  <Text style={styles.firstSessionSub}>
                    Pierwsza sesja · {sessionDuration} min
                  </Text>
                  <View style={styles.firstSessionItems}>
                    <FirstSessionItem
                      icon="chatbubble-outline"
                      text="Swobodna rozmowa o Twoich potrzebach i celach"
                    />
                    <FirstSessionItem
                      icon="shield-outline"
                      text="Pełna poufność — nic nie opuszcza tej przestrzeni"
                    />
                    <FirstSessionItem
                      icon="document-text-outline"
                      text="Bez formularzy — tylko Ty i terapeuta"
                    />
                    <FirstSessionItem
                      icon="arrow-forward-circle-outline"
                      text={`Wspólne ustalenie planu i częstotliwości sesji`}
                    />
                  </View>
                  <View style={styles.firstSessionFooter}>
                    <Ionicons
                      name="information-circle-outline"
                      size={13}
                      color={colors.text.quaternary}
                    />
                    <Text style={styles.firstSessionFooterText}>
                      Możesz anulować bezpłatnie do 24h przed sesją
                    </Text>
                  </View>
                </View>

                {/* Podejście terapeutyczne */}
                <View style={[cardStyles.card, styles.card]}>
                  <SectionHeader
                    icon="bulb-outline"
                    title="Podejście terapeutyczne"
                  />
                  <Text style={styles.bodyText}>{approach}</Text>
                  <View style={styles.tagsWrap}>
                    {specializations.map((s) => (
                      <View key={s} style={styles.tag}>
                        <Text style={styles.tagText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Wykształcenie */}
                <View style={[cardStyles.card, styles.card]}>
                  <SectionHeader
                    icon="school-outline"
                    title="Wykształcenie i szkolenia"
                  />
                  {education.map((edu, i) => (
                    <View key={i} style={styles.timelineRow}>
                      <View style={styles.timelineLeft}>
                        <View style={styles.timelineDot} />
                        {i < education.length - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                      </View>
                      <View style={styles.timelineRight}>
                        <Text style={styles.timelineYear}>{edu.year}</Text>
                        <Text style={styles.timelineDegree}>{edu.degree}</Text>
                        <Text style={styles.timelineInst}>
                          {edu.institution}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Certyfikaty */}
                <View style={[cardStyles.card, styles.card]}>
                  <SectionHeader
                    icon="ribbon-outline"
                    title="Certyfikaty i licencje"
                  />
                  {certifications.map((cert, i) => (
                    <View key={i} style={styles.certRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#4a9c5d"
                      />
                      <Text style={styles.certText}>{cert}</Text>
                    </View>
                  ))}
                </View>

                {/* Doświadczenie */}
                <View style={[cardStyles.card, styles.card]}>
                  <SectionHeader
                    icon="stats-chart-outline"
                    title="Doświadczenie"
                  />
                  <View style={styles.expStatsRow}>
                    <ExpStat
                      value={`${experience}`}
                      label={`lat\ndoświadczenia`}
                    />
                    <View style={styles.expStatsDivider} />
                    <ExpStat
                      value={`${sessionsCount}+`}
                      label={`sesji\nodbyto`}
                    />
                    <View style={styles.expStatsDivider} />
                    <ExpStat
                      value={`${reviewsCount}`}
                      label={`opinii\npacjentów`}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* ── TERMINY ── */}
            {activeTab === "terminy" && (
              <View style={styles.tabContent}>
                <View style={[cardStyles.card, styles.card]}>
                  <SectionHeader icon="list-outline" title="Rodzaj wizyty" />
                  <View style={styles.sessionTypeRow}>
                    {SESSION_TYPES.map((st) => (
                      <Pressable
                        key={st.id}
                        style={[
                          styles.sessionTypeBtn,
                          selectedSessionType === st.id &&
                            styles.sessionTypeBtnActive,
                        ]}
                        onPress={() => setSelectedSessionType(st.id)}
                      >
                        <Text
                          style={[
                            styles.sessionTypeLabel,
                            selectedSessionType === st.id &&
                              styles.sessionTypeLabelActive,
                          ]}
                        >
                          {st.label}
                        </Text>
                        <Text
                          style={[
                            styles.sessionTypeDesc,
                            selectedSessionType === st.id &&
                              styles.sessionTypeDescActive,
                          ]}
                        >
                          {st.desc}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={[cardStyles.card, styles.card]}>
                  <SectionHeader icon="calendar-outline" title="Wybierz datę" />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.datePicker}
                  >
                    {weekDays.map((day, i) => (
                      <Pressable
                        key={i}
                        style={[
                          styles.dayBtn,
                          selectedDate === i && styles.dayBtnActive,
                        ]}
                        onPress={() => setSelectedDate(i)}
                      >
                        <Text
                          style={[
                            styles.dayName,
                            selectedDate === i && styles.dayTextActive,
                          ]}
                        >
                          {i === 0 ? "Dziś" : DAYS_PL[day.getDay()]}
                        </Text>
                        <Text
                          style={[
                            styles.dayNum,
                            selectedDate === i && styles.dayTextActive,
                          ]}
                        >
                          {day.getDate()}
                        </Text>
                        <Text
                          style={[
                            styles.dayMonth,
                            selectedDate === i && styles.dayTextActive,
                          ]}
                        >
                          {MONTHS_PL[day.getMonth()]}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View style={[cardStyles.card, styles.card]}>
                  <SectionHeader
                    icon="time-outline"
                    title={`Dostępne godziny · ${selectedDayLabel}`}
                  />
                  <SlotGroup
                    label="Rano"
                    icon="sunny-outline"
                    slots={slots.morning}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                  />
                  <SlotGroup
                    label="Popołudnie"
                    icon="partly-sunny-outline"
                    slots={slots.afternoon}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                  />
                  <SlotGroup
                    label="Wieczór"
                    icon="moon-outline"
                    slots={slots.evening}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                  />
                </View>

                <View style={[cardStyles.card, styles.card]}>
                  <SectionHeader
                    icon="information-circle-outline"
                    title="Informacje o sesji"
                  />
                  <PolicyRow
                    icon="cash-outline"
                    text={`${pricePerSession} zł · sesja ${sessionDuration} min`}
                  />
                  <PolicyRow
                    icon="card-outline"
                    text="Bezpieczna płatność online"
                  />
                  <PolicyRow
                    icon="refresh-outline"
                    text="Anulowanie bezpłatne do 24h przed wizytą"
                  />
                  <PolicyRow
                    icon="lock-closed-outline"
                    text="Pełna poufność i szyfrowanie sesji"
                  />
                </View>
              </View>
            )}

            {/* ── OPINIE ── */}
            {activeTab === "opinie" && (
              <View style={styles.tabContent}>
                <View style={[cardStyles.card, styles.card]}>
                  <SectionHeader icon="star-outline" title="Oceny pacjentów" />
                  <View style={styles.ratingOverview}>
                    <View style={styles.ratingBigBox}>
                      <Text style={styles.ratingBigNum}>
                        {rating.toFixed(1)}
                      </Text>
                      <View style={styles.starsRow}>
                        {stars.map((filled, i) => (
                          <Ionicons
                            key={i}
                            name={filled ? "star" : "star-outline"}
                            size={15}
                            color={filled ? "#f5a623" : colors.text.quaternary}
                          />
                        ))}
                      </View>
                      <Text style={styles.ratingTotalText}>
                        {reviewsCount} opinii
                      </Text>
                    </View>
                    <View style={styles.ratingBars}>
                      {starCounts.map(({ star, count, pct }) => (
                        <View key={star} style={styles.ratingBarRow}>
                          <Text style={styles.ratingBarLabel}>{star}</Text>
                          <Ionicons name="star" size={10} color="#f5a623" />
                          <View style={styles.ratingBarBg}>
                            <View
                              style={[
                                styles.ratingBarFill,
                                { width: `${Math.max(pct, 2)}%` as any },
                              ]}
                            />
                          </View>
                          <Text style={styles.ratingBarCount}>{count}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {reviews.map((rev, i) => (
                  <View key={i} style={[cardStyles.card, styles.card]}>
                    <View style={styles.revHeader}>
                      <View style={styles.revAvatar}>
                        <Text style={styles.revAvatarText}>
                          {rev.author[0]}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.revAuthor}>{rev.author}</Text>
                        <View style={styles.revStarsRow}>
                          {Array.from({ length: rev.rating }).map((_, si) => (
                            <Ionicons
                              key={si}
                              name="star"
                              size={11}
                              color="#f5a623"
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.revDate}>{rev.date}</Text>
                    </View>
                    <Text style={styles.revText}>{rev.text}</Text>
                  </View>
                ))}

                <View style={styles.reviewsNote}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={13}
                    color={colors.text.quaternary}
                  />
                  <Text style={styles.reviewsNoteText}>
                    Wszystkie opinie pochodzą od zweryfikowanych pacjentów
                  </Text>
                </View>
              </View>
            )}
            {/* ── WIZYTY ── */}
            {activeTab === "wizyty" && (
              <View style={styles.tabContent}>
                {psychVisits.length === 0 ? (
                  <View style={styles.visitsEmpty}>
                    <Ionicons name="calendar-outline" size={48} color={colors.text.quaternary} />
                    <Text style={styles.visitsEmptyTitle}>Brak wizyt z tym specjalistą</Text>
                    <Text style={styles.visitsEmptySubtitle}>Umów pierwszą sesję w zakładce Terminy</Text>
                    <Pressable style={styles.visitsEmptyBtn} onPress={() => setActiveTab("terminy")}>
                      <Ionicons name="calendar-outline" size={15} color="#fff" />
                      <Text style={styles.visitsEmptyBtnText}>Umów wizytę</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    {psychUpcoming.length > 0 && (
                      <>
                        <View style={styles.visitsSectionHeader}>
                          <View style={styles.visitsSectionDot} />
                          <Text style={styles.visitsSectionTitle}>Nadchodzące</Text>
                          <View style={styles.visitsSectionBadge}>
                            <Text style={styles.visitsSectionBadgeText}>{psychUpcoming.length}</Text>
                          </View>
                        </View>
                        {psychUpcoming.map((v: Visit) => <PsychVisitCard key={v.id} visit={v} onCancel={() => cancelVisit(v.id)} />)}
                      </>
                    )}
                    {psychPast.length > 0 && (
                      <>
                        <View style={[styles.visitsSectionHeader, { marginTop: psychUpcoming.length > 0 ? spacing.md : 0 }]}>
                          <Ionicons name="time-outline" size={13} color={colors.text.secondary} />
                          <Text style={styles.visitsSectionTitle}>Historia wizyt</Text>
                        </View>
                        {psychPast.map((v) => <PsychVisitCard key={v.id} visit={v} />)}
                      </>
                    )}
                  </>
                )}
              </View>
            )}

          </ScrollView>

          {/* CTA bar */}
          <View style={styles.ctaBar}>
            {activeTab === "terminy" && !selectedSlot && (
              <Text style={styles.ctaHint}>
                Wybierz termin powyżej, aby zarezerwować
              </Text>
            )}
            <Animated.View
              style={{ width: "100%", transform: [{ scale: ctaScale }] }}
            >
              <Pressable
                style={[
                  styles.ctaButton,
                  activeTab === "terminy" &&
                    !selectedSlot &&
                    styles.ctaButtonDisabled,
                ]}
                onPress={
                  activeTab === "terminy"
                    ? handleBook
                    : () => setActiveTab("terminy")
                }
              >
                <Ionicons name="calendar-outline" size={18} color="#fff" />
                <Text style={styles.ctaText}>
                  {activeTab === "terminy" && selectedSlot
                    ? `Zarezerwuj: ${selectedDayLabel} ${selectedSlot}`
                    : `Umów wizytę · ${pricePerSession} zł`}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </LayoutContainer>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalRoot}>
          <BlurView
            intensity={38}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowConfirm(false)}
          />
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="checkmark-circle" size={60} color="#4a9c5d" />
            </View>
            <Text style={styles.confirmTitle}>Wizyta zarezerwowana!</Text>
            <Text style={styles.confirmSpecialist}>
              {title} {firstName} {lastName}
            </Text>
            <View style={styles.confirmDetails}>
              <ConfirmRow
                icon="calendar-outline"
                text={`${selectedDayLabel} · ${selectedSlot}`}
              />
              <ConfirmRow
                icon="time-outline"
                text={`${sessionDuration} minut`}
              />
              <ConfirmRow icon="videocam-outline" text={sessionFormats[0]} />
              <ConfirmRow icon="cash-outline" text={`${pricePerSession} zł`} />
            </View>
            <Text style={styles.confirmNote}>
              Potwierdzenie zostanie wysłane na Twój adres e-mail. Do
              zobaczenia!
            </Text>
            <Pressable
              style={styles.confirmBtn}
              onPress={() => {
                const day = weekDays[selectedDate];
                addVisit({
                  id: `v-${Date.now()}`,
                  psychologistId: id!,
                  psychologistName: `${firstName} ${lastName}`,
                  psychologistTitle: title,
                  psychologistSpecialty: specialty,
                  psychologistAvatarColor: avatarColor,
                  psychologistPhoto: photo,
                  date: day.toISOString().slice(0, 10),
                  time: selectedSlot!,
                  duration: sessionDuration,
                  format: sessionFormats[0],
                  sessionType: selectedSessionType as "first" | "follow",
                  price: pricePerSession,
                  status: "upcoming",
                });
                setShowConfirm(false);
                router.back();
              }}
            >
              <Text style={styles.confirmBtnText}>Powrót do aplikacji</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────


function PsychVisitCard({ visit, onCancel }: { visit: Visit; onCancel?: () => void }) {
  const isUpcoming = visit.status === "upcoming";
  const isCancelled = visit.status === "cancelled";

  const handleCancel = () => {
    Alert.alert(
      "Odwołaj wizytę",
      "Czy na pewno chcesz odwołać tę wizytę?",
      [
        { text: "Nie", style: "cancel" },
        { text: "Odwołaj", style: "destructive", onPress: () => onCancel?.() },
      ],
    );
  };

  return (
    <View style={[cardStyles.card, styles.visitCard]}>
      <View style={styles.visitCardTop}>
        <View style={styles.visitDateBox}>
          <Text style={styles.visitDateDay}>{visit.date.split("-")[2]}</Text>
          <Text style={styles.visitDateMonth}>{MONTHS_FULL[parseInt(visit.date.split("-")[1]) - 1].slice(0, 3)}</Text>
        </View>
        <View style={styles.visitCardInfo}>
          <Text style={styles.visitTime}>{visit.time} · {visit.duration} min</Text>
          <Text style={styles.visitFormat}>{visit.format}</Text>
          <Text style={styles.visitSessionType}>
            {visit.sessionType === "first" ? "Pierwsza wizyta" : "Kontynuacja terapii"}
          </Text>
        </View>
        <View>
          {isUpcoming && (
            <View style={styles.visitPillUpcoming}>
              <View style={styles.visitGreenDot} />
              <Text style={styles.visitPillUpcomingText}>Zaplanowana</Text>
            </View>
          )}
          {visit.status === "completed" && (
            <View style={styles.visitPillCompleted}>
              <Ionicons name="checkmark" size={10} color="#4a9c5d" />
              <Text style={styles.visitPillCompletedText}>Odbyta</Text>
            </View>
          )}
          {isCancelled && (
            <View style={styles.visitPillCancelled}>
              <Text style={styles.visitPillCancelledText}>Odwołana</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.visitDivider} />
      <View style={styles.visitFooter}>
        <Ionicons name="calendar-outline" size={12} color={colors.text.secondary} />
        <Text style={styles.visitFooterDate}>{formatVisitDate(visit.date)}</Text>
        <Text style={styles.visitFooterPrice}>{visit.price} zł</Text>
        {isUpcoming && onCancel && (
          <Pressable onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Odwołaj</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function SectionHeader({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={16} color={colors.text.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: any;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={18} color={colors.text.primary} />
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </View>
  );
}

function ExpStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.expStatBox}>
      <Text style={styles.expStatValue}>{value}</Text>
      <Text style={styles.expStatLabel}>{label}</Text>
    </View>
  );
}

function FirstSessionItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.firstSessionItem}>
      <View style={styles.firstSessionItemIcon}>
        <Ionicons name={icon} size={14} color={colors.text.primary} />
      </View>
      <Text style={styles.firstSessionItemText}>{text}</Text>
    </View>
  );
}

function PolicyRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.policyRow}>
      <Ionicons name={icon} size={15} color={colors.text.secondary} />
      <Text style={styles.policyText}>{text}</Text>
    </View>
  );
}

function SlotGroup({
  label,
  icon,
  slots,
  selectedSlot,
  onSelect,
}: {
  label: string;
  icon: any;
  slots: SlotInfo[];
  selectedSlot: string | null;
  onSelect: (t: string) => void;
}) {
  if (!slots.some((s) => s.available)) return null;
  return (
    <View style={styles.slotGroup}>
      <View style={styles.slotGroupHeader}>
        <Ionicons name={icon} size={13} color={colors.text.secondary} />
        <Text style={styles.slotGroupLabel}>{label}</Text>
      </View>
      <View style={styles.slotsGrid}>
        {slots.map((s) => (
          <Pressable
            key={s.time}
            disabled={!s.available}
            style={[
              styles.slot,
              !s.available && styles.slotTaken,
              selectedSlot === s.time && styles.slotSelected,
            ]}
            onPress={() => s.available && onSelect(s.time)}
          >
            <Text
              style={[
                styles.slotText,
                !s.available && styles.slotTextTaken,
                selectedSlot === s.time && styles.slotTextSelected,
              ]}
            >
              {s.time}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ConfirmRow({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.confirmRow}>
      <Ionicons name={icon} size={15} color={colors.text.secondary} />
      <Text style={styles.confirmRowText}>{text}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { ...typography.body, color: colors.text.secondary },

  backBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  scrollContent: { paddingBottom: 130 },

  // ── Hero ──
  hero: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.text.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },

  avatarRing: {
    width: 116,
    height: 116,
    borderRadius: 34,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  avatarWrap: {
    width: 108,
    height: 108,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarPhoto: {
    width: 108,
    height: 108,
    borderRadius: 30,
  },
  initials: { fontSize: 38, fontWeight: "700", color: colors.text.primary },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 2,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  heroName: {
    ...typography.heading1,
    color: colors.text.primary,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  heroSpecialty: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  langRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(55,90,133,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  langText: { fontSize: 11, fontWeight: "600", color: colors.text.secondary },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: spacing.sm,
  },
  starsRow: { flexDirection: "row", gap: 2 },
  ratingNum: { fontSize: 14, fontWeight: "700", color: colors.text.primary },
  ratingCount: { fontSize: 12, color: colors.text.secondary },

  availRow: { marginBottom: spacing.lg },
  availPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(111,174,122,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#6FAE7A",
  },
  availText: { fontSize: 12, fontWeight: "700", color: "#4a8a55" },
  availPillGray: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(55,90,133,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availTextGray: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },

  // 2×2 stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    width: "100%",
  },
  statCard: {
    width: "47.5%",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statCardValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
  },
  statCardLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: "center",
  },

  // ── Tab bar (underline) ──
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
    gap: 5,
  },
  tabLabel: {
    fontSize: 13,
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
    left: "10%",
    right: "10%",
    height: 2.5,
    backgroundColor: colors.text.primary,
    borderRadius: 2,
  },
  tabBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(55,90,133,0.15)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeActive: { backgroundColor: colors.text.primary },
  tabBadgeText: { fontSize: 9, fontWeight: "700", color: colors.text.secondary },
  tabBadgeTextActive: { color: "#fff" },

  // ── Tab content ──
  tabContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  card: { marginBottom: spacing.sm, padding: spacing.md },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.text.primary },

  bodyText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  expandBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
  },
  expandText: { fontSize: 13, fontWeight: "700", color: colors.text.primary },

  // "Pierwsza sesja" card
  firstSessionCard: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(55,90,133,0.1)",
  },
  firstSessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 2,
  },
  firstSessionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  firstSessionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  firstSessionSub: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    marginLeft: 44,
  },
  firstSessionItems: { gap: 10, marginBottom: spacing.md },
  firstSessionItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  firstSessionItemIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  firstSessionItemText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
    paddingTop: 3,
  },
  firstSessionFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(55,90,133,0.1)",
  },
  firstSessionFooterText: {
    fontSize: 11,
    color: colors.text.secondary,
  },

  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: "rgba(55,90,133,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tagText: { fontSize: 12, fontWeight: "600", color: colors.text.primary },

  timelineRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  timelineLeft: { alignItems: "center", width: 14, paddingTop: 3 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.text.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(55,90,133,0.2)",
    marginTop: 4,
    marginBottom: -spacing.sm,
    minHeight: 24,
  },
  timelineRight: { flex: 1, paddingBottom: spacing.sm },
  timelineYear: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  timelineDegree: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    lineHeight: 18,
  },
  timelineInst: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },

  certRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  certText: {
    flex: 1,
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  expStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(55,90,133,0.06)",
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  expStatBox: { flex: 1, alignItems: "center", gap: 3 },
  expStatValue: { fontSize: 22, fontWeight: "800", color: colors.text.primary },
  expStatLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 14,
  },
  expStatsDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(55,90,133,0.12)",
  },

  sessionTypeRow: { flexDirection: "row", gap: spacing.sm },
  sessionTypeBtn: {
    flex: 1,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: "rgba(55,90,133,0.15)",
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    gap: 4,
  },
  sessionTypeBtnActive: {
    borderColor: colors.text.primary,
    backgroundColor: "rgba(55,90,133,0.08)",
  },
  sessionTypeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  sessionTypeLabelActive: { color: colors.text.primary },
  sessionTypeDesc: {
    fontSize: 10,
    color: colors.text.quaternary,
    textAlign: "center",
  },
  sessionTypeDescActive: { color: colors.text.secondary },

  datePicker: { gap: spacing.sm, paddingVertical: 4 },
  dayBtn: {
    alignItems: "center",
    width: 60,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(55,90,133,0.12)",
    backgroundColor: "rgba(255,255,255,0.5)",
    gap: 2,
  },
  dayBtnActive: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  dayName: { fontSize: 11, fontWeight: "600", color: colors.text.secondary },
  dayNum: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
    lineHeight: 24,
  },
  dayMonth: { fontSize: 10, color: colors.text.secondary },
  dayTextActive: { color: "#fff" },

  slotGroup: { marginBottom: spacing.md },
  slotGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: spacing.sm,
  },
  slotGroupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  slot: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(55,90,133,0.2)",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  slotTaken: {
    borderColor: "rgba(55,90,133,0.06)",
    backgroundColor: "rgba(55,90,133,0.03)",
  },
  slotSelected: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  slotText: { fontSize: 13, fontWeight: "600", color: colors.text.primary },
  slotTextTaken: {
    color: colors.text.quaternary,
    textDecorationLine: "line-through",
  },
  slotTextSelected: { color: "#fff" },

  policyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  policyText: { ...typography.caption, color: colors.text.secondary },

  ratingOverview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  ratingBigBox: { alignItems: "center", gap: 4, width: 72 },
  ratingBigNum: {
    fontSize: 44,
    fontWeight: "800",
    color: colors.text.primary,
    lineHeight: 52,
  },
  ratingTotalText: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: "center",
  },
  ratingBars: { flex: 1, gap: 5 },
  ratingBarRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  ratingBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary,
    width: 10,
    textAlign: "right",
  },
  ratingBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(55,90,133,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#f5a623",
    borderRadius: 4,
  },
  ratingBarCount: {
    fontSize: 11,
    color: colors.text.secondary,
    width: 16,
    textAlign: "right",
  },

  revHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  revAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(55,90,133,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  revAvatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  revAuthor: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  revStarsRow: { flexDirection: "row", gap: 2, marginTop: 2 },
  revDate: { fontSize: 11, color: colors.text.quaternary, marginLeft: "auto" },
  revText: {
    ...typography.caption,
    color: colors.text.secondary,
    lineHeight: 20,
    fontStyle: "italic",
  },

  reviewsNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    opacity: 0.6,
  },
  reviewsNoteText: { fontSize: 11, color: colors.text.secondary },

  // CTA
  ctaBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "rgba(55,90,133,0.1)",
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  ctaHint: { fontSize: 11, color: colors.text.secondary },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.text.primary,
    borderRadius: 16,
    paddingVertical: 16,
    width: "100%",
    shadowColor: colors.text.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  ctaButtonDisabled: {
    backgroundColor: "rgba(55,90,133,0.3)",
    shadowOpacity: 0,
  },
  ctaText: { ...typography.title, fontWeight: "700", color: "#fff" },

  // ── Wizyty tab ──
  visitsEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  visitsEmptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  visitsEmptySubtitle: {
    fontSize: 13,
    color: colors.text.quaternary,
    textAlign: "center",
  },
  visitsEmptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
    backgroundColor: colors.text.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
  },
  visitsEmptyBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  visitsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
  },
  visitsSectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6FAE7A",
  },
  visitsSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
  },
  visitsSectionBadge: {
    backgroundColor: colors.text.primary,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  visitsSectionBadgeText: { fontSize: 10, fontWeight: "700", color: "#fff" },

  visitCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  visitCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  visitDateBox: {
    width: 44,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(55,90,133,0.08)",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  visitDateDay: { fontSize: 18, fontWeight: "800", color: colors.text.primary, lineHeight: 22 },
  visitDateMonth: { fontSize: 10, fontWeight: "600", color: colors.text.secondary },
  visitCardInfo: { flex: 1, gap: 2 },
  visitTime: { fontSize: 13, fontWeight: "700", color: colors.text.primary },
  visitFormat: { fontSize: 11, color: colors.text.secondary },
  visitSessionType: { fontSize: 11, color: colors.text.quaternary, fontStyle: "italic" },
  visitPillUpcoming: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(111,174,122,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  visitGreenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#6FAE7A" },
  visitPillUpcomingText: { fontSize: 10, fontWeight: "700", color: "#4a8a55" },
  visitPillCompleted: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(74,156,93,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  visitPillCompletedText: { fontSize: 10, fontWeight: "600", color: "#4a9c5d" },
  visitPillCancelled: {
    backgroundColor: "rgba(192,80,77,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  visitPillCancelledText: { fontSize: 10, fontWeight: "600", color: "#c0504d" },
  visitDivider: {
    height: 1,
    backgroundColor: "rgba(55,90,133,0.08)",
    marginVertical: spacing.sm,
  },
  visitFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  visitFooterDate: { fontSize: 12, color: colors.text.secondary, flex: 1 },
  visitFooterPrice: { fontSize: 13, fontWeight: "700", color: colors.text.primary },

  // Modal
  modalRoot: { flex: 1, alignItems: "center", justifyContent: "center" },
  confirmCard: {
    width: "86%",
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 26,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  confirmIconWrap: { marginBottom: spacing.md },
  confirmTitle: {
    ...typography.heading1,
    color: colors.text.primary,
    fontWeight: "700",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  confirmSpecialist: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  confirmDetails: {
    width: "100%",
    backgroundColor: "rgba(55,90,133,0.06)",
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  confirmRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  confirmRowText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  confirmNote: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  confirmBtn: {
    backgroundColor: colors.text.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    width: "100%",
    alignItems: "center",
  },
  confirmBtnText: { ...typography.title, fontWeight: "700", color: "#fff" },
  cancelBtn: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(192,80,77,0.1)",
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: "#c0504d",
  },
});
