import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
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

const DECO = ["🌿", "💙", "⭐", "🌸", "✨"];
const DECO_POSITIONS = [
  { top: "12%", left: "6%" },
  { top: "9%", right: "10%" },
  { top: "28%", left: "3%" },
  { top: "26%", right: "5%" },
  { top: "18%", left: "43%" },
];

// ─── Intro screen ─────────────────────────────────────────────────────────────

function OnboardingIntro({ onStart }: { onStart: () => void }) {
  const insets = useSafeAreaInsets();

  const screenFade = useRef(new Animated.Value(1)).current;
  const mainFloat = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(32)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const subSlide = useRef(new Animated.Value(24)).current;
  const subFade = useRef(new Animated.Value(0)).current;
  const dotsFade = useRef(new Animated.Value(0)).current;
  const btnSlide = useRef(new Animated.Value(20)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const decoAnims = useRef(
    DECO.map(() => ({
      fade: new Animated.Value(0),
      float: new Animated.Value(0),
    })),
  ).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mainFloat, {
          toValue: -10,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(mainFloat, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    decoAnims.forEach((a, i) => {
      Animated.sequence([
        Animated.delay(i * 120),
        Animated.timing(a.fade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(a.float, {
            toValue: -8,
            duration: 1800 + i * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(a.float, {
            toValue: 0,
            duration: 1800 + i * 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });

    const stagger = (
      delay: number,
      fade: Animated.Value,
      slide?: Animated.Value,
    ) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(fade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          ...(slide
            ? [
                Animated.timing(slide, {
                  toValue: 0,
                  duration: 400,
                  easing: Easing.out(Easing.ease),
                  useNativeDriver: true,
                }),
              ]
            : []),
        ]),
      ]).start();

    stagger(200, titleFade, titleSlide);
    stagger(380, subFade, subSlide);
    stagger(520, dotsFade);
    stagger(600, btnFade, btnSlide);
  }, []);

  const handleStart = () => {
    Animated.timing(screenFade, {
      toValue: 0,
      duration: 280,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => onStart());
  };

  return (
    <Animated.View style={{ flex: 1, opacity: screenFade }}>
      <ImageBackground
        source={require("../assets/background.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={[
            s.container,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
          ]}
        >
          {/* Decorative floating icons */}
          {DECO.map((d, i) => (
            <Animated.View
              key={i}
              style={[
                s.deco,
                DECO_POSITIONS[i] as any,
                {
                  opacity: decoAnims[i].fade,
                  transform: [{ translateY: decoAnims[i].float }],
                },
              ]}
            >
              <View style={s.decoIcon}>
                <Text style={{ fontSize: 16 }}>{d}</Text>
              </View>
            </Animated.View>
          ))}

          <View style={s.center}>
            {/* Main icon */}
            <Animated.View
              style={[
                s.mainIconWrap,
                { transform: [{ translateY: mainFloat }] },
              ]}
            >
              <View style={s.mainIconBg}>
                <Ionicons
                  name="happy-outline"
                  size={52}
                  color={colors.text.primary}
                />
              </View>
            </Animated.View>

            <Animated.Text
              style={[
                s.title,
                { opacity: titleFade, transform: [{ translateY: titleSlide }] },
              ]}
            >
              Prawie gotowe!
            </Animated.Text>

            <Animated.Text
              style={[
                s.subtitle,
                { opacity: subFade, transform: [{ translateY: subSlide }] },
              ]}
            >
              Odpowiedz na kilka pytań —{"\n"}dostosujemy aplikację do Ciebie
            </Animated.Text>

            <Animated.View style={[s.dotsRow, { opacity: dotsFade }]}>
              {QUESTIONS.map((_, i) => (
                <View key={i} style={s.dot} />
              ))}
            </Animated.View>
          </View>

          <Animated.View
            style={[
              { width: "100%" },
              { opacity: btnFade, transform: [{ translateY: btnSlide }] },
            ]}
          >
            <Pressable style={s.btn} onPress={handleStart}>
              <Text style={s.btnText}>Zaczynamy →</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

// ─── Questions screen ─────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, user: userRaw } = useLocalSearchParams<{
    token: string;
    user: string;
  }>();
  const loginSilent = useAuthStore((state) => state.loginSilent);

  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const iconFade = useRef(new Animated.Value(0)).current;
  const emojiFloat = useRef(new Animated.Value(0)).current;

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const hasSelection = selected.length > 0;

  React.useEffect(() => {
    if (showIntro) return;
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    iconScale.setValue(0.7);
    iconFade.setValue(0);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 340,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 340,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(iconFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showIntro]);

  React.useEffect(() => {
    if (showIntro) return;
    emojiFloat.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(emojiFloat, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(emojiFloat, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [showIntro]);

  const animateTransition = (
    direction: "forward" | "back",
    callback: () => void,
  ) => {
    const exitTo = direction === "forward" ? -28 : 28;
    const enterFrom = direction === "forward" ? 28 : -28;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: exitTo,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(iconFade, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(iconScale, {
        toValue: 0.8,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(enterFrom);
      iconScale.setValue(0.8);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(iconFade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleBack = () => {
    if (step === 0) return;
    animateTransition("back", () => {
      const prev = step - 1;
      setStep(prev);
      setSelected(answers[QUESTIONS[prev].id] ?? []);
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
        /* kontynuuj nawet jeśli zapis się nie powiedzie */
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
      const next = step + 1;
      setStep(next);
      setSelected(newAnswers[QUESTIONS[next].id] ?? []);
    });
  };

  const toggleOption = (label: string) =>
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  if (showIntro) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <OnboardingIntro onStart={() => setShowIntro(false)} />
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ImageBackground
        source={require("../assets/background.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View
          style={[
            q.container,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 },
          ]}
        >
          {/* Top bar */}
          <View style={q.topBar}>
            <Pressable
              style={[q.backBtn, step === 0 && q.backBtnHidden]}
              onPress={handleBack}
              disabled={step === 0}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={colors.text.primary}
              />
            </Pressable>

            <View style={q.progressDots}>
              {QUESTIONS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    q.progressDot,
                    i === step && q.progressDotActive,
                    i < step && q.progressDotDone,
                  ]}
                />
              ))}
            </View>

            <View style={{ width: 34 }} />
          </View>

          {/* Question content */}
          <Animated.View
            style={[
              q.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Icon in tile style */}
            <Animated.View
              style={[
                q.questionIconWrap,
                {
                  opacity: iconFade,
                  transform: [{ scale: iconScale }, { translateY: emojiFloat }],
                },
              ]}
            >
              <View style={q.questionIconBg}>
                <Text style={{ fontSize: 42 }}>{current.emoji}</Text>
              </View>
            </Animated.View>

            <Text style={q.questionText}>{current.question}</Text>
            {current.hint && <Text style={q.hint}>{current.hint}</Text>}

            <View style={q.options}>
              {current.options.map((opt) => {
                const isActive = selected.includes(opt.label);
                return (
                  <Pressable
                    key={opt.label}
                    style={[q.option, isActive && q.optionActive]}
                    onPress={() => toggleOption(opt.label)}
                  >
                    <Text style={q.optionEmoji}>{opt.emoji}</Text>
                    <Text
                      style={[q.optionText, isActive && q.optionTextActive]}
                    >
                      {opt.label}
                    </Text>
                    <View style={[q.checkbox, isActive && q.checkboxActive]}>
                      {isActive && (
                        <Ionicons name="checkmark" size={13} color="#fff" />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Button */}
          <Pressable
            style={[q.btn, (!hasSelection || isSaving) && q.btnDisabled]}
            onPress={handleNext}
            disabled={!hasSelection || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={q.btnText}>
                {isLast ? "Zacznijmy! 🚀" : "Dalej →"}
              </Text>
            )}
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

// ─── Intro styles ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  deco: {
    position: "absolute",
  },
  decoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainIconWrap: {
    marginBottom: 28,
  },
  mainIconBg: {
    width: 104,
    height: 104,
    borderRadius: 32,
    backgroundColor: "rgba(182,204,233,0.45)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#375a85",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 32,
    opacity: 0.85,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.primary,
    opacity: 0.3,
  },
  btn: {
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
  btnText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
});

// ─── Question styles ───────────────────────────────────────────────────────────

const q = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnHidden: {
    opacity: 0,
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  progressDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  progressDotActive: {
    width: 22,
    backgroundColor: colors.text.primary,
  },
  progressDotDone: {
    backgroundColor: "rgba(55,90,133,0.4)",
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 48,
  },
  questionIconWrap: {
    marginBottom: 24,
  },
  questionIconBg: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#375a85",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
  },
  questionText: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  hint: {
    fontSize: 13,
    color: colors.text.secondary,
    opacity: 0.65,
    marginBottom: 24,
  },
  options: {
    width: "100%",
    gap: 10,
    marginTop: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.45)",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionActive: {
    backgroundColor: "rgba(255,255,255,0.88)",
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
  btn: {
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
  btnDisabled: {
    opacity: 0.38,
  },
  btnText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
});
