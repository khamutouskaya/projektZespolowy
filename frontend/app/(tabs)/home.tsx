import LayoutContainer from "@/shared/layout/LayoutContainer";
import { cardStyles } from "@/shared/theme/styles";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "@/services/store/useAuthStore";

const GOLD = "#f9dd0c";

const PREMIUM_FEATURES = [
  { icon: "people-outline", label: "Praca z psychologiem" },
  { icon: "analytics-outline", label: "Głęboka analiza wzorców" },
  { icon: "flash-outline", label: "Wykrywanie triggerów stresu" },
  { icon: "bar-chart-outline", label: "Analiza nastroju (tydzień / miesiąc)" },
  { icon: "bulb-outline", label: "AI-porady na podstawie zachowania" },
  { icon: "trophy-outline", label: "Adaptacyjne cele" },
] as const;

export default function Home() {
  const router = useRouter();
  const isPremium = useAuthStore((s) => s.user?.isPremium ?? false);
  const buyPremium = useAuthStore((s) => s.buyPremium);

  const [showOracle, setShowOracle] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [showFruitModal, setShowFruitModal] = useState(false);
  const [oracleAnswer, setOracleAnswer] = useState<string | null>(null);
  const [isOracleThinking, setIsOracleThinking] = useState(false);

  // Home cloud float
  const cloudFloat = useRef(new Animated.Value(0)).current;
  // Oracle cloud
  const oracleFloat = useRef(new Animated.Value(0)).current;
  const oracleScale = useRef(new Animated.Value(1)).current;
  // Answer reveal
  const answerScale = useRef(new Animated.Value(0)).current;
  const answerOpacity = useRef(new Animated.Value(0)).current;
  // Thinking pulse
  const thinkingPulse = useRef(new Animated.Value(1)).current;
  // Planet tile pulse
  const tileGlow = useRef(new Animated.Value(1)).current;
  // Stars
  const star1 = useRef(new Animated.Value(0.3)).current;
  const star2 = useRef(new Animated.Value(0.7)).current;
  const star3 = useRef(new Animated.Value(0.5)).current;
  const star4 = useRef(new Animated.Value(0.2)).current;
  const star5 = useRef(new Animated.Value(0.8)).current;
  const star6 = useRef(new Animated.Value(0.4)).current;

  // Screen mount fade-in
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(16)).current;
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
  }, [screenOpacity, screenSlide]);

  // Home cloud gentle float
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudFloat, {
          toValue: -12,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(cloudFloat, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [cloudFloat]);

  // Planet tile breathing pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tileGlow, {
          toValue: 1.18,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(tileGlow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [tileGlow]);

  // Oracle animations when modal opens/closes
  useEffect(() => {
    if (!showOracle) {
      oracleFloat.stopAnimation();
      oracleFloat.setValue(0);
      [star1, star2, star3, star4, star5, star6].forEach((s) =>
        s.stopAnimation(),
      );
      return;
    }
    Animated.loop(
      Animated.sequence([
        Animated.timing(oracleFloat, {
          toValue: -18,
          duration: 1900,
          useNativeDriver: true,
        }),
        Animated.timing(oracleFloat, {
          toValue: 0,
          duration: 1900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    const twinkle = (anim: Animated.Value, delay: number, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.08,
            duration,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    twinkle(star1, 0, 800);
    twinkle(star2, 350, 650);
    twinkle(star3, 700, 1000);
    twinkle(star4, 150, 750);
    twinkle(star5, 500, 900);
    twinkle(star6, 250, 1100);
  }, [showOracle, oracleFloat, star1, star2, star3, star4, star5, star6]);

  const cloudThoughts = [
    "Małe kroki też są postępem.",
    "Nie musisz robić wszystkiego naraz.",
    "Dziś też jest dobry dzień, żeby zacząć.",
    "Jesteś bliżej niż myślisz.",
    "Spokój też jest siłą.",
    "Nawet mała refleksja ma znaczenie.",
    "To, że próbujesz, już jest ważne.",
    "Nie jesteś sam. Jesteśmy tu, by cię wspierać.",
    "Każdy dzień to nowa szansa na lepsze jutro.",
    "Twoje uczucia są ważne. Pozwól sobie je odczuwać.",
    "Małe kroki prowadzą do wielkich zmian.",
    "Jesteś silniejszy, niż myślisz.",
    "Nie musisz być doskonały, by być wartościowy.",
    "Twoja historia jest ważna. Podziel się nią, jeśli chcesz.",
    "Każdy ma prawo do wsparcia i zrozumienia.",
    "Nie bój się prosić o pomoc. To oznaka siły, nie słabości.",
    "Twoje emocje są ważne. Znajdź sposób, by je wyrazić.",
  ];

  const thoughtOfTheDay =
    cloudThoughts[new Date().getDate() % cloudThoughts.length];
  // STREAK MOCK (потім підключиш бек)
  const streakDays = 2;

  const hasJournalEntryToday = true;
  const hasDailySummaryToday = true;

  const progress = Number(hasJournalEntryToday) + Number(hasDailySummaryToday);

  const isReady = progress === 2;

  const handleOracleOpen = () => {
    setShowOracle(true);
    setOracleAnswer(null);
    setIsOracleThinking(false);
    answerScale.setValue(0);
    answerOpacity.setValue(0);
    oracleScale.setValue(1);
  };

  const handleOracleAnswer = () => {
    if (isOracleThinking) return;
    setIsOracleThinking(true);
    setOracleAnswer(null);
    answerScale.setValue(0);
    answerOpacity.setValue(0);

    // Cloud squish → spring bounce
    Animated.sequence([
      Animated.spring(oracleScale, {
        toValue: 0.86,
        useNativeDriver: true,
        speed: 60,
        bounciness: 0,
      }),
      Animated.spring(oracleScale, {
        toValue: 1.1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }),
      Animated.spring(oracleScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 6,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(thinkingPulse, {
          toValue: 0.3,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(thinkingPulse, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    setTimeout(() => {
      const answers = ["Tak", "Nie"];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      setOracleAnswer(randomAnswer);
      setIsOracleThinking(false);
      pulse.stop();
      thinkingPulse.setValue(1);
      Animated.parallel([
        Animated.spring(answerScale, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 20,
          speed: 8,
        }),
        Animated.timing(answerOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1400);
  };

  const handleOracleClose = () => {
    setShowOracle(false);
    setOracleAnswer(null);
    setIsOracleThinking(false);
    oracleScale.setValue(1);
    thinkingPulse.setValue(1);
  };

  const handlePsychologistPress = () => {
    if (isPremium) {
      router.push("../psychologists");
    } else {
      setShowPaywall(true);
    }
  };

  const handleBuyPremium = async () => {
    setIsBuying(true);
    try {
      await buyPremium();
      setShowPaywall(false);
      router.push("../psychologists");
    } catch (e: any) {
      const detail =
        e?.response?.data?.message ?? e?.message ?? "Nieznany błąd";
      Alert.alert("Błąd", `Nie udało się aktywować Premium.\n${detail}`);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <>
      <LayoutContainer>
        <Animated.View
          style={[
            styles.safe,
            {
              opacity: screenOpacity,
              transform: [{ translateY: screenSlide }],
            },
          ]}
        >
          {/* Przycisk profilu */}
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push("../profile")}
          >
            <Ionicons
              name="person-outline"
              size={22}
              color="rgba(70,90,110,0.75)"
            />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.Image
              source={require("../../assets/images/cloud.png")}
              style={[
                styles.cloud,
                { transform: [{ translateY: cloudFloat }] },
              ]}
            />
            <View style={styles.header}>
              <Text style={styles.hey}>Hej!</Text>
              <Text style={styles.title}>Jak się dziś czujesz?</Text>
            </View>

            {/* STREAK FRUIT CARD */}
            <View style={[cardStyles.card, styles.statusCard]}>
              <View style={styles.compactStreakRow}>
                <Image
                  source={require("../../assets/images/fruit.png")}
                  style={[
                    styles.compactFruit,
                    {
                      opacity:
                        progress === 0 ? 0.25 : progress === 1 ? 0.55 : 1,
                    },
                  ]}
                />

                <View style={styles.compactStreakContent}>
                  <View style={styles.compactStreakTop}>
                    <Text style={styles.compactTitle}>Dzisiejszy owoc</Text>

                    {progress === 2 ? (
                      <Pressable
                        style={styles.claimFruitMiniButton}
                        onPress={() => setShowFruitModal(true)}
                      >
                        <Text style={styles.claimFruitMiniText}>
                          Odbierz 🍎
                        </Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.compactProgress}>{progress}/2</Text>
                    )}
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(progress / 2) * 100}%` },
                      ]}
                    />
                  </View>

                  <Text style={styles.compactSubtitle}>
                    Wpis w dzienniku · Podsumowanie dnia
                  </Text>
                </View>
              </View>
            </View>

            {/* Tiles row */}
            <View style={styles.tilesRow}>
              <UniverseTile
                label="Wszechświat"
                sub="Zapytaj chmurkę"
                iconBg="rgba(182,182,230,0.4)"
                onPress={handleOracleOpen}
                glowAnim={tileGlow}
              />
              <Tile
                icon="diamond-outline"
                label="Akcesoria"
                sub="Twoje zasoby"
                iconBg="rgba(245,220,150,0.4)"
                onPress={() => router.push("../accessories")}
              />
              <Tile
                icon="flower-outline"
                label="Ogródek"
                sub="Zadbaj o siebie"
                iconBg="rgba(200,230,190,0.4)"
                onPress={() => router.push("../garden")}
              />
            </View>

            {/* Thought card */}
            <View style={[cardStyles.card, styles.thoughtCard]}>
              <View style={styles.thoughtHeader}>
                <Ionicons
                  name="cloudy-outline"
                  size={15}
                  color={colors.text.tertiary}
                />
                <Text style={styles.sectionLabel}>Myśl chmurki</Text>
              </View>
              <Text style={styles.thoughtText}>
                <Text style={styles.thoughtQuote}>{"\u201C"}</Text>
                {thoughtOfTheDay}
                <Text style={styles.thoughtQuote}>{"\u201D"}</Text>
              </Text>
            </View>

            {/* Praca z psychologiem + Test psychotypu */}
            <View style={styles.extraRow}>
              <Pressable
                style={({ pressed }) => [
                  cardStyles.card,
                  styles.extraCard,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handlePsychologistPress}
              >
                <View
                  style={[
                    styles.extraIcon,
                    { backgroundColor: "rgba(182,204,233,0.4)" },
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={24}
                    color={colors.text.primary}
                  />
                </View>
                <Text style={styles.extraTitle}>Praca z{"\n"}psychologiem</Text>
                <Text style={styles.extraSub}>Umów konsultację online</Text>
                {!isPremium && (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={10} color="#fff" />
                    <Text style={styles.lockBadgeText}>Premium</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  cardStyles.card,
                  styles.extraCard,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => router.push("../psychotype")}
              >
                <View
                  style={[
                    styles.extraIcon,
                    { backgroundColor: "rgba(233,182,204,0.4)" },
                  ]}
                >
                  <Ionicons
                    name="clipboard-outline"
                    size={24}
                    color={colors.text.primary}
                  />
                </View>
                <Text style={styles.extraTitle}>Test{"\n"}psychotypu</Text>
                <Text style={styles.extraSub}>Poznaj swój profil</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </LayoutContainer>

      {/* Paywall modal */}
      <Modal
        visible={showPaywall}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaywall(false)}
      >
        <Pressable
          style={styles.paywallOverlay}
          onPress={() => setShowPaywall(false)}
        >
          <Pressable style={styles.paywallCard} onPress={() => {}}>
            <View style={styles.paywallHandle} />
            <View style={styles.paywallHeader}>
              <Text style={styles.paywallTitle}>Plan Premium</Text>
              <Pressable
                style={styles.paywallClose}
                onPress={() => setShowPaywall(false)}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color={colors.text.secondary}
                />
              </Pressable>
            </View>

            <Text style={styles.paywallIntro}>
              Odblokuj pracę z psychologiem i zaawansowane funkcje AI.
            </Text>

            {PREMIUM_FEATURES.map((f, i) => (
              <View key={i} style={styles.paywallFeature}>
                <View style={styles.paywallFeatureIcon}>
                  <Ionicons name={f.icon} size={16} color="#6670ff" />
                </View>
                <Text style={styles.paywallFeatureText}>{f.label}</Text>
              </View>
            ))}

            <Text style={styles.paywallPrice}>od 29 zł / miesiąc</Text>

            <TouchableOpacity
              style={styles.paywallBuyBtn}
              onPress={handleBuyPremium}
              disabled={isBuying}
              activeOpacity={0.82}
            >
              <LinearGradient
                colors={["#b6b9ee", "#838bf5", "#6670ff"]}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={styles.paywallBuyGradient}
              >
                <Ionicons name="star" size={16} color={GOLD} />
                <Text style={styles.paywallBuyText}>
                  {isBuying ? "Aktywowanie..." : "Kup Premium"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showFruitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFruitModal(false)}
      >
        <View style={styles.fruitModalRoot}>
          <Pressable
            style={styles.fruitModalBackdrop}
            onPress={() => setShowFruitModal(false)}
          />

          <View style={styles.fruitModalCard}>
            <Image
              source={require("../../assets/images/fruit.png")}
              style={styles.fruitModalImage}
            />

            <Text style={styles.fruitModalTitle}>Owoc dojrzał!</Text>
            <Text style={styles.fruitModalText}>Co chcesz z nim zrobić?</Text>

            <Pressable style={styles.fruitModalPlantButton}>
              <Text style={styles.fruitModalPlantText}>Zasadź w ogródku</Text>
            </Pressable>

            <Pressable style={styles.fruitModalExchangeButton}>
              <Text style={styles.fruitModalExchangeText}>
                Wymień na monety
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showOracle}
        transparent
        animationType="fade"
        onRequestClose={handleOracleClose}
      >
        <View style={styles.modalRoot}>
          <BlurView
            intensity={38}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={styles.overlayBackdrop}
            onPress={handleOracleClose}
          />
          {/* Twinkling stars */}
          <Animated.Text
            style={[
              styles.star,
              { top: 115, left: 38, fontSize: 13, opacity: star1 },
            ]}
          >
            ✦
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { top: 155, right: 52, fontSize: 9, opacity: star2 },
            ]}
          >
            ★
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { top: 240, left: 75, fontSize: 8, opacity: star3 },
            ]}
          >
            ✦
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { top: 310, right: 28, fontSize: 14, opacity: star4 },
            ]}
          >
            ✦
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { top: 440, left: 28, fontSize: 10, opacity: star5 },
            ]}
          >
            ★
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { top: 490, right: 65, fontSize: 12, opacity: star6 },
            ]}
          >
            ✦
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { top: 590, left: 55, fontSize: 7, opacity: star2 },
            ]}
          >
            ★
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { top: 180, left: 130, fontSize: 8, opacity: star4 },
            ]}
          >
            ✦
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              { top: 380, left: 110, fontSize: 10, opacity: star3 },
            ]}
          >
            ★
          </Animated.Text>

          <Pressable style={styles.closeButton} onPress={handleOracleClose}>
            <Ionicons name="close" size={26} color={colors.text.secondary} />
          </Pressable>
          <View style={styles.oracleStage}>
            <Pressable onPress={handleOracleAnswer}>
              <Animated.Image
                source={require("../../assets/images/cloud.png")}
                style={[
                  styles.oracleMainCloud,
                  {
                    transform: [
                      { translateY: oracleFloat },
                      { scale: oracleScale },
                    ],
                  },
                ]}
              />
            </Pressable>
            <Animated.View
              style={[
                styles.oracleBubbleWrap,
                { transform: [{ translateY: oracleFloat }] },
              ]}
            >
              <Image
                source={require("../../assets/images/oracleBubble.png")}
                style={styles.oracleBubbleImage}
              />
              <View style={styles.oracleBubbleText}>
                {isOracleThinking ? (
                  <Animated.Text
                    style={[styles.oracleText, { opacity: thinkingPulse }]}
                  >
                    {"• • •"}
                  </Animated.Text>
                ) : !oracleAnswer ? (
                  <Text style={styles.oracleText}>
                    Zadaj pytanie w głowie{"\n"}i naciśnij chmurkę
                  </Text>
                ) : (
                  <Animated.Text
                    style={[
                      styles.oracleAnswer,
                      {
                        transform: [{ scale: answerScale }],
                        opacity: answerOpacity,
                      },
                    ]}
                  >
                    {oracleAnswer}
                  </Animated.Text>
                )}
              </View>
            </Animated.View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function UniverseTile({
  label,
  sub,
  iconBg,
  onPress,
  glowAnim,
}: {
  label: string;
  sub: string;
  iconBg: string;
  onPress: () => void;
  glowAnim: Animated.Value;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        cardStyles.card,
        styles.tile,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Animated.View
        style={[
          styles.tileIcon,
          { backgroundColor: iconBg, transform: [{ scale: glowAnim }] },
        ]}
      >
        <Ionicons name="planet-outline" size={22} color={colors.text.primary} />
      </Animated.View>
      <Text style={styles.tileText}>{label}</Text>
      <Text style={styles.tileSub}>{sub}</Text>
    </Pressable>
  );
}

function Tile({
  icon,
  label,
  sub,
  iconBg,
  onPress,
}: {
  icon: any;
  label: string;
  sub: string;
  iconBg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        cardStyles.card,
        styles.tile,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={[styles.tileIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={colors.text.primary} />
      </View>
      <Text style={styles.tileText}>{label}</Text>
      <Text style={styles.tileSub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  scrollContent: {
    alignItems: "center",
    paddingBottom: 100, //bylo 100
  },

  cloud: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },

  header: {
    marginTop: -20,
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  hey: {
    ...typography.name,
    color: colors.text.primary,
  },

  title: {
    ...typography.heading1,
    color: colors.text.primary,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  statusCard: {
    width: "92%",
    marginTop: spacing.md,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },

  sectionLabel: {
    ...typography.small,
    color: colors.text.secondary,
    fontWeight: "600",
    marginBottom: spacing.sm,
    paddingLeft: spacing.s,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: "rgba(173,219,183,0.35)",
  },

  statusText: {
    ...typography.titleSmall,
    fontWeight: "700",
    color: colors.text.secondary,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(70,80,90,0.30)",
    marginHorizontal: spacing.sm,
  },

  sproutWrap: {
    marginLeft: "auto",
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  tilesRow: {
    width: "92%",
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },

  tile: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 10,
    gap: 8,
  },

  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  tileText: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },

  tileSub: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: "center",
    opacity: 0.7,
  },

  thoughtCard: {
    width: "92%",
    marginTop: spacing.md,
  },

  bottomText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(70,80,90,0.78)",
    flexShrink: 1,
    lineHeight: 22,
  },

  profileButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.62)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 10,
  },

  thoughtHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },

  thoughtText: {
    ...typography.small,
    color: colors.text.secondary,
    fontStyle: "italic",
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  thoughtQuote: {
    fontSize: 22,
    fontStyle: "normal",
    fontWeight: "700",
    color: colors.text.tertiary,
    lineHeight: 24,
  },

  extraRow: {
    flexDirection: "row",
    width: "92%",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  extraCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 10,
    gap: 8,
  },

  extraIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  extraTitle: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    lineHeight: 17,
  },

  extraSub: {
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: "center",
    opacity: 0.7,
  },

  modalRoot: {
    flex: 1,
  },

  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  closeButton: {
    position: "absolute",
    top: 72,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  oracleStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  oracleMainCloud: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginTop: 40,
  },

  oracleBubbleWrap: {
    position: "absolute",
    top: 210,
    right: 1,
    width: 190,
    height: 155,
  },

  oracleBubbleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  oracleBubbleText: {
    position: "absolute",
    top: 34,
    left: 40,
    width: 112,
    alignItems: "center",
    justifyContent: "center",
  },

  oracleText: {
    ...typography.body,
    fontWeight: "700",
    color: colors.text.secondary,
    textAlign: "center",
  },

  oracleAnswer: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  streakSub: {
    fontSize: 12,
    color: colors.text.secondary,
    opacity: 0.7,
    paddingLeft: spacing.s,
    marginTop: -4,
  },

  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(173,219,183,0.35)",
  },

  streakBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text.secondary,
  },

  fruitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  fruitWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  fruitImage: {
    width: 62,
    height: 62,
    resizeMode: "contain",
  },

  tasksWrap: {
    flex: 1,
    gap: 8,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  taskText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text.secondary,
  },

  progressText: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(70,80,90,0.65)",
  },

  readyActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(111,174,122,0.35)",
    alignItems: "center",
  },

  actionButtonSecondary: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(245,220,150,0.45)",
    alignItems: "center",
  },

  actionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4f7f58",
  },

  actionTextSecondary: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7b6730",
  },
  compactStreakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  compactFruit: {
    width: 54,
    height: 54,
    resizeMode: "contain",
  },

  compactStreakContent: {
    flex: 1,
  },

  compactStreakTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  compactTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text.secondary,
  },

  compactProgress: {
    fontSize: 14,
    fontWeight: "800",
    color: "rgba(70,80,90,0.55)",
  },

  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(70,80,90,0.10)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(111,174,122,0.55)",
  },

  compactSubtitle: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(70,80,90,0.55)",
  },

  claimFruitMiniButton: {
    paddingHorizontal: 14,
    height: 30,
    borderRadius: 999,
    backgroundColor: "rgba(111,174,122,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  claimFruitMiniText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4f7f58",
  },

  fruitModalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  fruitModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30,40,60,0.55)",
  },

  fruitModalCard: {
    width: "82%",
    borderRadius: 28,
    padding: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  fruitModalImage: {
    width: 82,
    height: 82,
    resizeMode: "contain",
    marginBottom: 8,
  },

  fruitModalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 6,
  },

  fruitModalText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 16,
  },

  fruitModalPlantButton: {
    width: "100%",
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(111,174,122,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  fruitModalPlantText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#4f7f58",
  },

  fruitModalExchangeButton: {
    width: "100%",
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(245,220,150,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  fruitModalExchangeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#7b6730",
  },
  star: {
    position: "absolute",
    color: "rgba(80,100,160,0.65)",
  },

  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(100,110,255,0.85)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },

  lockBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  paywallOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  paywallCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: 40,
  },

  paywallHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(150,160,180,0.4)",
    alignSelf: "center",
    marginBottom: spacing.md,
  },

  paywallHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },

  paywallTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text.primary,
  },

  paywallClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(150,160,180,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  paywallIntro: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },

  paywallFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 7,
  },

  paywallFeatureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(100,110,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  paywallFeatureText: {
    ...typography.small,
    fontWeight: "600",
    color: colors.text.primary,
  },

  paywallPrice: {
    textAlign: "center",
    ...typography.small,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  paywallBuyBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },

  paywallBuyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 15,
    paddingHorizontal: spacing.lg,
  },

  paywallBuyText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
