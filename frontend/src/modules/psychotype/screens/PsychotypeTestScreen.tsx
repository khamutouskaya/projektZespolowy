import LayoutContainer from "@/shared/layout/LayoutContainer";
import { cardStyles } from "@/shared/theme/styles";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { psychotypeService } from "../psychotype.service";
import {
  PersonalityAnswer,
  PersonalityQuestion,
  PersonalityResult,
} from "../psychotype.types";

type Phase = "init" | "intro" | "quiz" | "loading" | "result";

const TRAIT_META: Record<
  string,
  {
    label: string;
    description: string;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  O: {
    label: "Otwartość",
    description:
      "Ciekawość świata, wyobraźnia, kreatywność i otwartość na nowe doświadczenia.",
    color: "rgba(124,107,232,0.85)",
    icon: "sparkles-outline",
  },
  C: {
    label: "Sumienność",
    description:
      "Zorganizowanie, wytrwałość, samodyscyplina i dbałość o szczegóły.",
    color: "rgba(55,90,133,0.85)",
    icon: "checkmark-circle-outline",
  },
  E: {
    label: "Ekstrawersja",
    description:
      "Towarzyskość, energiczność i aktywność w relacjach z innymi ludźmi.",
    color: "rgba(247,183,49,0.9)",
    icon: "flash-outline",
  },
  A: {
    label: "Ugodowość",
    description: "Empatia, współpraca, życzliwość i troska o dobro innych.",
    color: "rgba(76,175,146,0.85)",
    icon: "heart-outline",
  },
  N: {
    label: "Neurotyczność",
    description:
      "Podatność na stres, zmienność nastrojów i reaktywność emocjonalna.",
    color: "rgba(239,83,80,0.85)",
    icon: "warning-outline",
  },
};

const LIKERT = [
  { value: 1, label: "Zupełnie\nnie" },
  { value: 2, label: "Raczej\nnie" },
  { value: 3, label: "Trudno\npowiedzieć" },
  { value: 4, label: "Raczej\ntak" },
  { value: 5, label: "Zdecydowanie\ntak" },
];

export default function PsychotypeTestScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("init");
  const [questions, setQuestions] = useState<PersonalityQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PersonalityAnswer[]>([]);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(16)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardSlide = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(screenSlide, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    psychotypeService.getProfile().then((profile) => {
      if (profile) {
        setResult(profile);
        setPhase("result");
        Animated.parallel([
          Animated.timing(resultOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(resultSlide, {
            toValue: 0,
            speed: 12,
            bounciness: 4,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setPhase("intro");
      }
    });
  }, []);

  const loadQuestions = async () => {
    setError(null);
    try {
      const data = await psychotypeService.getQuestions();
      setQuestions(data);
      setCurrentIndex(0);
      setAnswers([]);
      setSelectedValue(null);
      progressAnim.setValue(1 / data.length);
      setPhase("quiz");
    } catch {
      setError("Nie udało się załadować testu. Sprawdź połączenie.");
    }
  };

  const animateCardOut = (callback: () => void) => {
    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 130,
      useNativeDriver: true,
    }).start(() => {
      cardSlide.setValue(20);
      callback();
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlide, {
          toValue: 0,
          speed: 22,
          bounciness: 3,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (selectedValue === null) return;
    const newAnswer: PersonalityAnswer = {
      questionId: questions[currentIndex].id,
      value: selectedValue,
    };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      Animated.timing(progressAnim, {
        toValue: (nextIndex + 1) / questions.length,
        duration: 350,
        useNativeDriver: false,
      }).start();
      animateCardOut(() => {
        setCurrentIndex(nextIndex);
        setSelectedValue(null);
      });
    } else {
      submit(newAnswers);
    }
  };

  const submit = async (finalAnswers: PersonalityAnswer[]) => {
    setPhase("loading");
    setError(null);
    try {
      const res = await psychotypeService.submitAnswers(finalAnswers);
      setResult(res);
      setPhase("result");
      Animated.parallel([
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(resultSlide, {
          toValue: 0,
          speed: 12,
          bounciness: 4,
          useNativeDriver: true,
        }),
      ]).start();
    } catch {
      setError("Nie udało się przetworzyć wyników. Spróbuj ponownie.");
      setPhase("quiz");
    }
  };

  const swipePan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dx > 15 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (g.dx > 60) handleBack();
      },
    }),
  ).current;

  const handleBack = () => {
    if (currentIndex === 0) return;
    const prevIndex = currentIndex - 1;
    Animated.timing(progressAnim, {
      toValue: (prevIndex + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
    animateCardOut(() => {
      setCurrentIndex(prevIndex);
      const prevAnswer = answers[prevIndex];
      setSelectedValue(prevAnswer?.value ?? null);
      setAnswers((prev) => prev.slice(0, prevIndex));
    });
  };

  const handleRestart = () => {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedValue(null);
    setResult(null);
    setError(null);
    progressAnim.setValue(0);
    resultOpacity.setValue(0);
    resultSlide.setValue(24);
    cardOpacity.setValue(1);
    cardSlide.setValue(0);
  };

  const currentQuestion = questions[currentIndex];
  const traitMeta = currentQuestion ? TRAIT_META[currentQuestion.trait] : null;

  return (
    <LayoutContainer>
      <Animated.View
        style={[
          styles.safe,
          { opacity: screenOpacity, transform: [{ translateY: screenSlide }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={phase === "quiz" ? handleBack : () => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={colors.text.secondary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Test osobowości</Text>
          {phase === "quiz" ? (
            <Pressable style={styles.exitButton} onPress={() => router.back()}>
              <Text style={styles.exitButtonText}>Wyjdź</Text>
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color="#c0504d" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* INIT */}
        {phase === "init" && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text.primary} />
          </View>
        )}

        {/* INTRO */}
        {phase === "intro" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={[cardStyles.card, styles.introCard]}>
              <View
                style={[
                  styles.bigIconWrap,
                  { backgroundColor: "rgba(124,107,232,0.15)" },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={40}
                  color={colors.text.primary}
                />
              </View>
              <Text style={styles.introTitle}>Poznaj swoją osobowość</Text>
              <Text style={styles.introBody}>
                Test oparty na modelu Wielkiej Piątki (Big Five) — jednym z
                najbardziej rzetelnych naukowych modeli osobowości. Wynik pokaże
                Twój profil w 5 wymiarach.
              </Text>

              <View style={styles.traitsPreview}>
                {Object.entries(TRAIT_META).map(([key, meta]) => (
                  <View key={key} style={styles.traitPill}>
                    <Ionicons name={meta.icon} size={13} color={meta.color} />
                    <Text style={[styles.traitPillText, { color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.introStats}>
                <View style={styles.introStat}>
                  <Ionicons
                    name="help-circle-outline"
                    size={18}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.introStatText}>50 pytań</Text>
                </View>
                <View style={styles.introDot} />
                <View style={styles.introStat}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.introStatText}>~10 min</Text>
                </View>
                <View style={styles.introDot} />
                <View style={styles.introStat}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.introStatText}>Prywatnie</Text>
                </View>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.85 },
              ]}
              onPress={loadQuestions}
            >
              <Text style={styles.primaryButtonText}>Rozpocznij test</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </ScrollView>
        )}

        {/* QUIZ */}
        {phase === "quiz" && currentQuestion && traitMeta && (
          <View style={styles.quizRoot} {...swipePan.panHandlers}>
            {/* Progress */}
            <View style={styles.progressWrap}>
              <Text style={styles.progressLabel}>
                {currentIndex + 1} / {questions.length}
              </Text>
              <View style={styles.progressBg}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                      backgroundColor: traitMeta.color,
                    },
                  ]}
                />
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.quizScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Trait badge */}
              <View
                style={[
                  styles.traitBadge,
                  { backgroundColor: traitMeta.color + "33" },
                ]}
              >
                <Ionicons name={traitMeta.icon} size={14} color="#1a2d4a" />
                <Text style={styles.traitBadgeText}>{traitMeta.label}</Text>
              </View>

              {/* Question */}
              <Animated.View
                style={[
                  cardStyles.card,
                  styles.questionCard,
                  {
                    opacity: cardOpacity,
                    transform: [{ translateY: cardSlide }],
                  },
                ]}
              >
                <Text style={styles.questionText}>{currentQuestion.text}</Text>
              </Animated.View>

              {/* Likert scale */}
              <Animated.View
                style={[
                  styles.likertWrap,
                  {
                    opacity: cardOpacity,
                    transform: [{ translateY: cardSlide }],
                  },
                ]}
              >
                <View style={styles.likertRow}>
                  {LIKERT.map((item) => {
                    const selected = selectedValue === item.value;
                    const size =
                      34 + (item.value === 1 || item.value === 5 ? 2 : 0);
                    return (
                      <Pressable
                        key={item.value}
                        style={styles.likertItem}
                        onPress={() => setSelectedValue(item.value)}
                      >
                        <View
                          style={[
                            styles.likertCircle,
                            {
                              width: size,
                              height: size,
                              borderRadius: size / 2,
                            },
                            selected && {
                              backgroundColor: traitMeta.color,
                              borderColor: traitMeta.color,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.likertNum,
                              selected && styles.likertNumSelected,
                            ]}
                          >
                            {item.value}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.likertLabel,
                            selected && {
                              color: traitMeta.color,
                              fontWeight: "700",
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>

              {/* Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  !selectedValue && styles.primaryButtonDisabled,
                  pressed && selectedValue ? { opacity: 0.85 } : null,
                ]}
                onPress={handleNext}
                disabled={!selectedValue}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    !selectedValue && styles.primaryButtonTextDisabled,
                  ]}
                >
                  {currentIndex < questions.length - 1
                    ? "Następne pytanie"
                    : "Zakończ test"}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={selectedValue ? "#fff" : "rgba(150,150,160,0.5)"}
                />
              </Pressable>
            </ScrollView>
          </View>
        )}

        {/* LOADING */}
        {phase === "loading" && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text.primary} />
            <Text style={styles.loadingText}>
              Analizujemy Twoje odpowiedzi…
            </Text>
          </View>
        )}

        {/* RESULT */}
        {phase === "result" && result && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View
              style={{
                opacity: resultOpacity,
                transform: [{ translateY: resultSlide }],
              }}
            >
              <Text style={styles.resultLabel}>Twój profil osobowości</Text>

              {Object.entries(TRAIT_META).map(([key, meta]) => {
                const score = ((result as any)[key] as number) ?? 0;
                const pct = ((score - 1) / 4) * 100;
                const level =
                  score >= 3.5 ? "Wysoki" : score >= 2.5 ? "Średni" : "Niski";
                const levelColor =
                  score >= 3.5
                    ? meta.color
                    : score >= 2.5
                      ? "rgba(150,160,180,0.9)"
                      : "rgba(200,100,90,0.8)";
                return (
                  <View key={key} style={[cardStyles.card, styles.traitCard]}>
                    <View style={styles.traitCardHeader}>
                      <View
                        style={[
                          styles.traitIconWrap,
                          { backgroundColor: meta.color + "22" },
                        ]}
                      >
                        <Ionicons
                          name={meta.icon}
                          size={20}
                          color={meta.color}
                        />
                      </View>
                      <View style={styles.traitCardInfo}>
                        <Text style={styles.traitCardLabel}>{meta.label}</Text>
                        <Text style={styles.traitCardDesc}>
                          {meta.description}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.levelBadge,
                          { backgroundColor: levelColor + "22" },
                        ]}
                      >
                        <Text
                          style={[styles.levelBadgeText, { color: levelColor }]}
                        >
                          {level}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.barBg}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${Math.round(pct)}%` as any,
                            backgroundColor: meta.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.scoreText, { color: meta.color }]}>
                      {score.toFixed(2)} / 5.00
                    </Text>
                  </View>
                );
              })}

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleRestart}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={colors.text.secondary}
                />
                <Text style={styles.secondaryButtonText}>Powtórz test</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        )}
      </Animated.View>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.62)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  headerTitle: { ...typography.title, color: colors.text.primary },
  headerSpacer: { width: 46 },
  exitButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.62)",
    borderWidth: 1,
    borderColor: "rgba(200,210,230,0.5)",
  },
  exitButtonText: { fontSize: 14, fontWeight: "600", color: "#1a2d4a" },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: "rgba(192,80,77,0.1)",
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  errorText: { ...typography.caption, color: "#c0504d", flex: 1 },

  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
    gap: spacing.md,
  },

  // ── INTRO ─────────────────────────────────────────
  introCard: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  bigIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  introTitle: {
    ...typography.heading1,
    color: colors.text.primary,
    textAlign: "center",
  },
  introBody: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
  traitsPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginVertical: spacing.xs,
  },
  traitPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderWidth: 1,
    borderColor: "rgba(200,210,230,0.5)",
  },
  traitPillText: { fontSize: 12, fontWeight: "700" },
  introStats: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  introStat: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  introStatText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: "600",
  },
  introDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(70,80,90,0.3)",
  },

  // ── BUTTONS ───────────────────────────────────────
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.text.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    shadowColor: colors.text.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: "rgba(200,200,210,0.5)",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: { ...typography.small, color: "#fff", fontWeight: "700" },
  primaryButtonTextDisabled: { color: "rgba(150,150,160,0.6)" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    shadowColor: "#5f5c5c",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  secondaryButtonText: {
    ...typography.small,
    color: colors.text.secondary,
    fontWeight: "600",
  },

  // ── QUIZ ──────────────────────────────────────────
  quizRoot: { flex: 1 },
  quizCenter: { flex: 1 },
  quizBottom: {},
  quizScroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  progressWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(200,200,220,0.35)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressLabel: {
    ...typography.caption,
    color: "#1a2d4a",
    fontWeight: "600",
    opacity: 0.7,
  },
  traitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  traitBadgeText: { fontSize: 13, fontWeight: "700", color: "#1a2d4a" },
  questionCard: { paddingVertical: spacing.xl },
  questionText: { ...typography.title, color: "#1a2d4a", lineHeight: 28 },

  likertWrap: { gap: spacing.sm },
  likertRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 4,
  },
  likertItem: { alignItems: "center", gap: 6, flex: 1 },
  likertCircle: {
    borderWidth: 2,
    borderColor: "rgba(150,160,180,0.4)",
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  likertNum: { fontSize: 14, fontWeight: "700", color: colors.text.secondary },
  likertNumSelected: { color: "#fff" },
  likertLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 13,
  },

  // ── LOADING ───────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    fontStyle: "italic",
  },

  // ── RESULT ────────────────────────────────────────
  resultLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a2d4a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  traitCard: { gap: spacing.sm, paddingVertical: spacing.md },
  traitCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  traitIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  traitCardInfo: { flex: 1 },
  traitCardLabel: {
    ...typography.small,
    fontWeight: "700",
    color: "#1a2d4a",
    marginBottom: 2,
  },
  traitCardDesc: { ...typography.caption, color: "#454850", lineHeight: 17 },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    flexShrink: 0,
  },
  levelBadgeText: { fontSize: 11, fontWeight: "700" },
  barBg: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(200,200,220,0.3)",
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  scoreText: { fontSize: 12, fontWeight: "700", textAlign: "right" },
});
