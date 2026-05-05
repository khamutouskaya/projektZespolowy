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
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { psychologists } from "../data/psychologists";

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

type Tab = "profil" | "terminy" | "opinie";

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

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 280,
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
            {/* HERO */}
            <View style={styles.hero}>
              <View style={styles.premiumBadge}>
                <Ionicons name="shield-checkmark" size={11} color="#fff" />
                <Text style={styles.premiumText}>PREMIUM · ZWERYFIKOWANY</Text>
              </View>

              <View
                style={[styles.avatarWrap, { backgroundColor: avatarColor }]}
              >
                <Text style={styles.initials}>{initials}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#4a9c5d" />
                </View>
              </View>

              <Text style={styles.heroName}>
                {title} {firstName} {lastName}
              </Text>
              <Text style={styles.heroSpecialty}>{specialty}</Text>

              <View style={styles.ratingRow}>
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
                <Text style={styles.ratingNum}>{rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({reviewsCount} opinii)</Text>
              </View>

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

              <View style={styles.quickRow}>
                <View style={styles.quickPill}>
                  <Ionicons
                    name="cash-outline"
                    size={14}
                    color={colors.text.primary}
                  />
                  <Text style={styles.quickVal}>{pricePerSession} zł</Text>
                  <Text style={styles.quickSub}>/sesja</Text>
                </View>
                <View style={styles.quickDivider} />
                <View style={styles.quickPill}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={colors.text.primary}
                  />
                  <Text style={styles.quickVal}>{sessionDuration} min</Text>
                </View>
                <View style={styles.quickDivider} />
                <View style={styles.quickPill}>
                  <Ionicons
                    name="videocam-outline"
                    size={14}
                    color={colors.text.primary}
                  />
                  <Text style={styles.quickVal}>
                    {sessionFormats.join(" / ")}
                  </Text>
                </View>
                <View style={styles.quickDivider} />
                <View style={styles.quickPill}>
                  <Ionicons
                    name="briefcase-outline"
                    size={14}
                    color={colors.text.primary}
                  />
                  <Text style={styles.quickVal}>{experience} lat</Text>
                </View>
              </View>
            </View>

            {/* TAB BAR */}
            <View style={styles.tabBar}>
              {(["profil", "terminy", "opinie"] as Tab[]).map((tab) => (
                <Pressable
                  key={tab}
                  style={[
                    styles.tabBtn,
                    activeTab === tab && styles.tabBtnActive,
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Ionicons
                    name={
                      tab === "profil"
                        ? "person-outline"
                        : tab === "terminy"
                          ? "calendar-outline"
                          : "star-outline"
                    }
                    size={20}
                    color={activeTab === tab ? "#fff" : colors.text.primary}
                  />
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
                        : "Opinie"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* INLINE CONTENT */}
            <View style={styles.tabContent}>
              {/* ── PROFIL ── */}
              {activeTab === "profil" && (
                <>
                  <View style={[cardStyles.card, styles.card]}>
                    <SectionHeader
                      icon="person-circle-outline"
                      title="O mnie"
                    />
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
                          <Text style={styles.timelineDegree}>
                            {edu.degree}
                          </Text>
                          <Text style={styles.timelineInst}>
                            {edu.institution}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

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

                  <View style={[cardStyles.card, styles.card]}>
                    <SectionHeader
                      icon="videocam-outline"
                      title="Forma i czas sesji"
                    />
                    <View style={styles.sessionInfoGrid}>
                      <InfoBox
                        icon="time-outline"
                        value={`${sessionDuration} min`}
                        label="Czas sesji"
                      />
                      {sessionFormats.map((fmt) => (
                        <InfoBox
                          key={fmt}
                          icon={
                            fmt === "Online"
                              ? "laptop-outline"
                              : "business-outline"
                          }
                          value={fmt}
                          label="Forma"
                        />
                      ))}
                      <InfoBox
                        icon="globe-outline"
                        value={languages.join(", ")}
                        label="Języki"
                      />
                    </View>
                  </View>

                  <View style={[cardStyles.card, styles.card]}>
                    <SectionHeader
                      icon="stats-chart-outline"
                      title="Doświadczenie"
                    />
                    <View style={styles.statsRow}>
                      <StatBox
                        value={`${experience}`}
                        label={`lat\ndoświadczenia`}
                      />
                      <View style={styles.statsDivider} />
                      <StatBox
                        value={`${sessionsCount}+`}
                        label={`sesji\nodbyto`}
                      />
                      <View style={styles.statsDivider} />
                      <StatBox
                        value={`${reviewsCount}`}
                        label={`opinii\npacjentów`}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* ── TERMINY ── */}
              {activeTab === "terminy" && (
                <>
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
                    <SectionHeader
                      icon="calendar-outline"
                      title="Wybierz datę"
                    />
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
                </>
              )}

              {/* ── OPINIE ── */}
              {activeTab === "opinie" && (
                <>
                  <View style={[cardStyles.card, styles.card]}>
                    <SectionHeader
                      icon="star-outline"
                      title="Oceny pacjentów"
                    />
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
                              size={16}
                              color={
                                filled ? "#f5a623" : colors.text.quaternary
                              }
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
                </>
              )}
            </View>
          </ScrollView>

          {/* CTA bar — fixed bottom */}
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
              <Ionicons name="checkmark-circle" size={56} color="#4a9c5d" />
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

function SectionHeader({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={16} color={colors.text.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoBox({
  icon,
  value,
  label,
}: {
  icon: any;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.infoBox}>
      <Ionicons name={icon} size={20} color={colors.text.primary} />
      <Text style={styles.infoBoxVal}>{value}</Text>
      <Text style={styles.infoBoxLabel}>{label}</Text>
    </View>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  const hasAvailable = slots.some((s) => s.available);
  if (!hasAvailable) return null;
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
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  scrollContent: {
    paddingBottom: 130,
  },

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
    marginBottom: spacing.xxl,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 1,
  },
  avatarWrap: {
    width: 94,
    height: 94,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  initials: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.text.primary,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  heroName: {
    ...typography.heading1,
    color: colors.text.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  heroSpecialty: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: spacing.sm,
  },
  starsRow: { flexDirection: "row", gap: 2 },
  ratingNum: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },
  ratingCount: { fontSize: 12, color: colors.text.secondary },

  availRow: { marginBottom: spacing.md },
  availPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(111,174,122,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
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
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  availTextGray: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },

  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  quickPill: { flex: 1, alignItems: "center", gap: 2 },
  quickVal: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },
  quickSub: { fontSize: 10, color: colors.text.secondary },
  quickDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(55,90,133,0.12)",
  },

  tabBar: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  tabBtnActive: {
    backgroundColor: colors.text.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  tabLabelActive: {
    color: "#fff",
    fontWeight: "700",
  },

  tabContent: {
    paddingHorizontal: spacing.md,
  },
  card: { marginBottom: spacing.sm, padding: spacing.md },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.primary,
  },

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

  sessionInfoGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  infoBox: {
    flex: 1,
    minWidth: 80,
    alignItems: "center",
    backgroundColor: "rgba(55,90,133,0.06)",
    borderRadius: 14,
    paddingVertical: spacing.md,
    gap: 5,
  },
  infoBoxVal: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },
  infoBoxLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: "center",
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(55,90,133,0.06)",
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  statBox: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 22, fontWeight: "800", color: colors.text.primary },
  statLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 14,
  },
  statsDivider: {
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
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(55,90,133,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  revAvatarText: {
    fontSize: 14,
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
});
