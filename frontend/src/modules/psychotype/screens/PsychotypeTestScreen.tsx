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
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { psychotypeService } from "../psychotype.service";
import { QuizAnswer, QuizQuestion, QuizResult } from "../psychotype.types";

type Phase = "intro" | "quiz" | "loading" | "result";

const PERSONALITY_COLORS: Record<string, string> = {
  empatyk: "rgba(233,182,204,0.5)",
  analityk: "rgba(182,204,233,0.5)",
  lider: "rgba(245,220,150,0.5)",
  marzyciel: "rgba(200,230,190,0.5)",
};

const PERSONALITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  empatyk: "heart-outline",
  analityk: "analytics-outline",
  lider: "flash-outline",
  marzyciel: "sparkles-outline",
};

const TYPE_LABELS: Record<string, string> = {
  empatyk: "Empatyk",
  analityk: "Analityk",
  lider: "Lider",
  marzyciel: "Marzyciel",
};

export default function PsychotypeTestScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(16)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardSlide = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.7)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(screenSlide, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [screenOpacity, screenSlide]);

  const loadQuestions = async () => {
    setError(null);
    try {
      const data = await psychotypeService.getQuestions();
      setQuestions(data);
      setCurrentIndex(0);
      setAnswers([]);
      setSelectedKey(null);
      progressAnim.setValue(data.length > 0 ? 1 / data.length : 0);
      setPhase("quiz");
    } catch {
      setError("Nie udało się załadować pytań. Sprawdź połączenie z internetem.");
    }
  };

  const animateCardTransition = (callback: () => void) => {
    Animated.timing(cardOpacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      cardSlide.setValue(24);
      callback();
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, speed: 20, bounciness: 4, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (!selectedKey) return;
    const newAnswer: QuizAnswer = { questionId: questions[currentIndex].id, selectedKey };
    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      Animated.timing(progressAnim, {
        toValue: (nextIndex + 1) / questions.length,
        duration: 380,
        useNativeDriver: false,
      }).start();
      animateCardTransition(() => {
        setCurrentIndex(nextIndex);
        setSelectedKey(null);
      });
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers: QuizAnswer[]) => {
    setPhase("loading");
    setError(null);
    try {
      const quizResult = await psychotypeService.submitAnswers(finalAnswers);
      setResult(quizResult);
      setPhase("result");
      Animated.parallel([
        Animated.spring(resultScale, { toValue: 1, bounciness: 10, speed: 6, useNativeDriver: true }),
        Animated.timing(resultOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    } catch {
      setError("Nie udało się zapisać wyników. Spróbuj ponownie.");
      setPhase("quiz");
    }
  };

  const handleRestart = () => {
    setPhase("intro");
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedKey(null);
    setResult(null);
    setError(null);
    progressAnim.setValue(0);
    resultScale.setValue(0.7);
    resultOpacity.setValue(0);
    cardOpacity.setValue(1);
    cardSlide.setValue(0);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <LayoutContainer>
      <Animated.View
        style={[styles.safe, { opacity: screenOpacity, transform: [{ translateY: screenSlide }] }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text.secondary} />
          </Pressable>
          <Text style={styles.headerTitle}>Test psychotypu</Text>
          <View style={styles.headerSpacer} />
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={16} color="#c0504d" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* INTRO */}
        {phase === "intro" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={[cardStyles.card, styles.introCard]}>
              <View style={[styles.bigIconWrap, { backgroundColor: "rgba(233,182,204,0.4)" }]}>
                <Ionicons name="clipboard-outline" size={40} color={colors.text.primary} />
              </View>
              <Text style={styles.introTitle}>Poznaj swój psychotyp</Text>
              <Text style={styles.introBody}>
                Odpowiedz szczerze na kilka pytań i odkryj, jaki typ osobowości dominuje w Twoim życiu.
                Wynik zostanie zapisany i pomoże lepiej dopasować wsparcie do Twoich potrzeb.
              </Text>
              <View style={styles.introStats}>
                <View style={styles.introStat}>
                  <Ionicons name="help-circle-outline" size={18} color={colors.text.secondary} />
                  <Text style={styles.introStatText}>8 pytań</Text>
                </View>
                <View style={styles.introDot} />
                <View style={styles.introStat}>
                  <Ionicons name="time-outline" size={18} color={colors.text.secondary} />
                  <Text style={styles.introStatText}>~3 min</Text>
                </View>
                <View style={styles.introDot} />
                <View style={styles.introStat}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.text.secondary} />
                  <Text style={styles.introStatText}>Prywatnie</Text>
                </View>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.85 }]}
              onPress={loadQuestions}
            >
              <Text style={styles.primaryButtonText}>Rozpocznij test</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </ScrollView>
        )}

        {/* QUIZ */}
        {phase === "quiz" && currentQuestion && (
          <View style={styles.quizRoot}>
            {/* Progress bar */}
            <View style={styles.progressWrap}>
              <View style={styles.progressBg}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {currentIndex + 1} / {questions.length}
              </Text>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Question card */}
              <Animated.View
                style={[
                  cardStyles.card,
                  styles.questionCard,
                  { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
                ]}
              >
                <Text style={styles.questionText}>{currentQuestion.text}</Text>
              </Animated.View>

              {/* Options */}
              <Animated.View
                style={{ opacity: cardOpacity, transform: [{ translateY: cardSlide }] }}
              >
                {currentQuestion.options.map((option) => {
                  const selected = selectedKey === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      style={({ pressed }) => [
                        cardStyles.card,
                        styles.optionCard,
                        selected && styles.optionCardSelected,
                        pressed && { opacity: 0.88 },
                      ]}
                      onPress={() => setSelectedKey(option.key)}
                    >
                      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                        {selected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                        {option.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </Animated.View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  !selectedKey && styles.primaryButtonDisabled,
                  pressed && selectedKey ? { opacity: 0.85 } : null,
                ]}
                onPress={handleNext}
                disabled={!selectedKey}
              >
                <Text style={[styles.primaryButtonText, !selectedKey && styles.primaryButtonTextDisabled]}>
                  {currentIndex < questions.length - 1 ? "Następne pytanie" : "Zakończ test"}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={selectedKey ? "#fff" : "rgba(150,150,160,0.5)"}
                />
              </Pressable>
            </ScrollView>
          </View>
        )}

        {/* LOADING */}
        {phase === "loading" && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.text.primary} />
            <Text style={styles.loadingText}>Analizujemy Twoje odpowiedzi…</Text>
          </View>
        )}

        {/* RESULT */}
        {phase === "result" && result && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View
              style={[
                cardStyles.card,
                styles.resultCard,
                { opacity: resultOpacity, transform: [{ scale: resultScale }] },
              ]}
            >
              <View
                style={[
                  styles.bigIconWrap,
                  { backgroundColor: PERSONALITY_COLORS[result.personalityType] ?? "rgba(200,200,220,0.4)" },
                ]}
              >
                <Ionicons
                  name={PERSONALITY_ICONS[result.personalityType] ?? "person-outline"}
                  size={44}
                  color={colors.text.primary}
                />
              </View>
              <Text style={styles.resultLabel}>Twój psychotyp to</Text>
              <Text style={styles.resultType}>{result.title}</Text>
              <Text style={styles.resultDescription}>{result.description}</Text>

              {/* Score bars */}
              <View style={styles.scoresWrap}>
                <Text style={styles.scoresTitle}>Rozkład wyników</Text>
                {Object.entries(result.scores).map(([type, score]) => {
                  const maxScore = Math.max(...Object.values(result.scores), 1);
                  const pct = score / maxScore;
                  return (
                    <View key={type} style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>{TYPE_LABELS[type] ?? type}</Text>
                      <View style={styles.scoreBarBg}>
                        <View
                          style={[
                            styles.scoreBarFill,
                            {
                              width: `${Math.round(pct * 100)}%`,
                              backgroundColor:
                                PERSONALITY_COLORS[type]?.replace("0.5", "0.85") ??
                                "rgba(180,180,220,0.85)",
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.scoreNum}>{score}</Text>
                    </View>
                  );
                })}
              </View>
            </Animated.View>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.85 }]}
              onPress={handleRestart}
            >
              <Ionicons name="refresh-outline" size={18} color={colors.text.secondary} />
              <Text style={styles.secondaryButtonText}>Powtórz test</Text>
            </Pressable>
          </ScrollView>
        )}
      </Animated.View>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

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

  headerTitle: {
    ...typography.title,
    color: colors.text.primary,
  },

  headerSpacer: {
    width: 46,
  },

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

  errorText: {
    ...typography.caption,
    color: "#c0504d",
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
    gap: spacing.md,
  },

  // ── INTRO ──────────────────────────────────────
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

  introStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  introStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

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

  // ── BUTTONS ────────────────────────────────────
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

  primaryButtonText: {
    ...typography.small,
    color: "#fff",
    fontWeight: "700",
  },

  primaryButtonTextDisabled: {
    color: "rgba(150,150,160,0.6)",
  },

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

  // ── QUIZ ───────────────────────────────────────
  quizRoot: {
    flex: 1,
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

  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.text.primary,
  },

  progressLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: "right",
    opacity: 0.75,
  },

  questionCard: {
    paddingVertical: spacing.xl,
  },

  questionText: {
    ...typography.title,
    color: colors.text.primary,
    lineHeight: 26,
  },

  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },

  optionCardSelected: {
    backgroundColor: "rgba(55,90,133,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(55,90,133,0.3)",
  },

  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(150,160,180,0.55)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  radioCircleSelected: {
    borderColor: colors.text.primary,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.text.primary,
  },

  optionText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 21,
  },

  optionTextSelected: {
    color: colors.text.primary,
    fontWeight: "600",
  },

  // ── LOADING ────────────────────────────────────
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

  // ── RESULT ─────────────────────────────────────
  resultCard: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },

  resultLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing.xs,
  },

  resultType: {
    ...typography.name,
    color: colors.text.primary,
  },

  resultDescription: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },

  scoresWrap: {
    width: "100%",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },

  scoresTitle: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  scoreLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    width: 70,
  },

  scoreBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(200,200,220,0.35)",
    overflow: "hidden",
  },

  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },

  scoreNum: {
    ...typography.caption,
    color: colors.text.secondary,
    width: 16,
    textAlign: "right",
    fontWeight: "700",
  },
});
