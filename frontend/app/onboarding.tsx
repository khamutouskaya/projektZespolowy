import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { onboardingApi } from "@/services/api/auth";
import { useAuthStore } from "@/services/store/useAuthStore";
import { UserPayload } from "@/types/auth.types";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/shared/theme/colors";

interface Question {
  id: string;
  question: string;
  emoji: string;
  hint?: string;
  options: { label: string; emoji: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "goal",
    question: "Jaki jest Twój główny cel?",
    emoji: "🎯",
    hint: "Możesz wybrać kilka",
    options: [
      { label: "Redukcja stresu", emoji: "🌿" },
      { label: "Poprawa nastroju", emoji: "☀️" },
      { label: "Śledzenie emocji", emoji: "📊" },
      { label: "Większa produktywność", emoji: "⚡" },
    ],
  },
  {
    id: "stress",
    question: "Jak często odczuwasz stres?",
    emoji: "🌊",
    options: [
      { label: "Rzadko", emoji: "😌" },
      { label: "Czasami", emoji: "🙂" },
      { label: "Często", emoji: "😤" },
      { label: "Prawie zawsze", emoji: "😰" },
    ],
  },
  {
    id: "mood_factor",
    question: "Co najczęściej wpływa na Twój nastrój?",
    emoji: "💭",
    hint: "Możesz wybrać kilka",
    options: [
      { label: "Praca / nauka", emoji: "💼" },
      { label: "Relacje z ludźmi", emoji: "👥" },
      { label: "Zdrowie i sen", emoji: "🛌" },
      { label: "Finanse", emoji: "💰" },
    ],
  },
  {
    id: "relax",
    question: "Jak wolisz się relaksować?",
    emoji: "🧘",
    hint: "Możesz wybrać kilka",
    options: [
      { label: "Medytacja / oddech", emoji: "🍃" },
      { label: "Aktywność fizyczna", emoji: "🏃" },
      { label: "Muzyka / filmy", emoji: "🎵" },
      { label: "Czas na świeżym powietrzu", emoji: "🌳" },
    ],
  },
  {
    id: "time",
    question: "O której porze dnia masz najwięcej energii?",
    emoji: "⏰",
    options: [
      { label: "Rano", emoji: "🌅" },
      { label: "W południe", emoji: "🌞" },
      { label: "Wieczorem", emoji: "🌇" },
      { label: "W nocy", emoji: "🌙" },
    ],
  },
  {
    id: "feeling",
    question: "Jak opisałbyś/abyś swoje obecne samopoczucie?",
    emoji: "💙",
    options: [
      { label: "Świetnie!", emoji: "🌟" },
      { label: "Całkiem dobrze", emoji: "😊" },
      { label: "Tak sobie", emoji: "😐" },
      { label: "Potrzebuję wsparcia", emoji: "🤗" },
    ],
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, user: userRaw } = useLocalSearchParams<{ token: string; user: string }>();
  const loginSilent = useAuthStore((state) => state.loginSilent);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const hasSelection = selected.length > 0;

  const animateTransition = (
    direction: "forward" | "back",
    callback: () => void,
  ) => {
    const exitTo = direction === "forward" ? -24 : 24;
    const enterFrom = direction === "forward" ? 24 : -24;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: exitTo,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(enterFrom);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleBack = () => {
    if (step === 0) return;
    animateTransition("back", () => {
      const prevStep = step - 1;
      setStep(prevStep);
      setSelected(answers[QUESTIONS[prevStep].id] ?? []);
    });
  };

  const handleNext = async () => {
    if (!hasSelection || isSaving) return;

    const newAnswers = { ...answers, [current.id]: selected };
    setAnswers(newAnswers);

    if (isLast) {
      setIsSaving(true);
      try {
        if (token && userRaw) {
          const user = JSON.parse(userRaw) as UserPayload;
          await loginSilent(token, user);
          await onboardingApi.saveAnswers(newAnswers);
        }
      } catch {
        // kontynuuj nawet jeśli zapis się nie powiedzie
      } finally {
        setIsSaving(false);
      }
      Alert.alert(
        "Konto zostało utworzone! 🎉",
        "Zalogowano. Możesz zacząć korzystać z aplikacji.",
        [{ text: "Zaczynamy!", onPress: () => router.replace("/(tabs)/home") }],
      );
      return;
    }

    animateTransition("forward", () => {
      const nextStep = step + 1;
      setStep(nextStep);
      setSelected(newAnswers[QUESTIONS[nextStep].id] ?? []);
    });
  };

  const toggleOption = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const progress = (step + 1) / QUESTIONS.length;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View
          style={[
            styles.safe,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
        >
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Pressable
              onPress={handleBack}
              style={[styles.backButton, step === 0 && styles.backButtonHidden]}
              disabled={step === 0}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={colors.text.primary}
              />
            </Pressable>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              {step + 1} / {QUESTIONS.length}
            </Text>
          </View>

          {/* Question card */}
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.emoji}>{current.emoji}</Text>
            <Text style={styles.question}>{current.question}</Text>
            {current.hint && <Text style={styles.hint}>{current.hint}</Text>}

            <View style={styles.options}>
              {current.options.map((opt) => {
                const isActive = selected.includes(opt.label);
                return (
                  <Pressable
                    key={opt.label}
                    style={[styles.option, isActive && styles.optionActive]}
                    onPress={() => toggleOption(opt.label)}
                  >
                    <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                    <Text
                      style={[
                        styles.optionText,
                        isActive && styles.optionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <View
                      style={[
                        styles.checkbox,
                        isActive && styles.checkboxActive,
                      ]}
                    >
                      {isActive && (
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Next button */}
          <Pressable
            style={[styles.button, (!hasSelection || isSaving) && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!hasSelection || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLast ? "Zacznijmy! 🚀" : "Dalej →"}
              </Text>
            )}
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },

  safe: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonHidden: {
    opacity: 0,
  },

  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: colors.text.primary,
  },

  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
    minWidth: 36,
    textAlign: "right",
  },

  card: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.52)",
    borderRadius: 28,
    paddingVertical: 44,
    paddingHorizontal: 26,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },

  emoji: {
    fontSize: 52,
    textAlign: "center",
    marginBottom: 14,
  },

  question: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 30,
  },

  hint: {
    fontSize: 13,
    color: colors.text.secondary,
    opacity: 0.7,
    marginBottom: 22,
  },

  options: {
    width: "100%",
    gap: 10,
    marginTop: 6,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },

  optionActive: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderColor: colors.text.primary,
  },

  optionEmoji: {
    fontSize: 22,
  },

  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.secondary,
  },

  optionTextActive: {
    color: colors.text.primary,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(111,122,134,0.3)",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxActive: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },

  button: {
    width: "100%",
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.text.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
});
