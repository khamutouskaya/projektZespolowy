import LayoutContainer from "@/shared/layout/LayoutContainer";
import { cardStyles } from "@/shared/theme/styles";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
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
import { useShopStore } from "@/services/store/useShopStore";
import { streakApi } from "@/services/api/streakApi";
import { useToastStore } from "@/services/store/useToastStore";

const GOLD = "#f9dd0c";

const DAILY_TREE_IMAGES: Record<number, any> = {
  0: require("../../assets/garden/tree-stage-0.png"),
  1: require("../../assets/garden/tree-stage-1.png"),
  2: require("../../assets/garden/tree-stage-2.png"),
};

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

  const { isAuthenticated } = useAuthStore();
  const { fetchEquippedItem, equippedPreviewImage } = useShopStore();

  const [showOracle, setShowOracle] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [showFruitModal, setShowFruitModal] = useState(false);
  const [showAppleSuccess, setShowAppleSuccess] = useState(false);
  const [isClaimingFruit, setIsClaimingFruit] = useState(false);

  const appleCardScale = useRef(new Animated.Value(0.72)).current;
  const appleCardOpacity = useRef(new Animated.Value(0)).current;
  const appleFloat = useRef(new Animated.Value(0)).current;
  const [showStreakInfo, setShowStreakInfo] = useState<"noEntry" | "claimed" | null>(null);
  const [oracleAnswer, setOracleAnswer] = useState<string | null>(null);
  const [isOracleThinking, setIsOracleThinking] = useState(false);

  const [dailyProgress, setDailyProgress] = useState(0);
  const [hasDailyFruitUsed, setHasDailyFruitUsed] = useState(false);
  const [hasDailyRewardClaimed, setHasDailyRewardClaimed] = useState(false);
  const [hasJournalEntry, setHasJournalEntry] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [coinsBalance, setCoinsBalance] = useState(0);

  // Once the daily reward is claimed it must stay "claimed" for the whole session,
  // regardless of note deletions or navigation that might reset state before the
  // next loadDailyStatus() call returns.
  const claimedThisSessionRef = useRef(false);

  const loadDailyStatus = useCallback(async () => {
    try {
      const status = await streakApi.getDailyStatus();
      setDailyProgress(status.progress);
      setHasDailyFruitUsed(status.hasDailyFruitUsed ?? false);
      const claimed = (status.hasDailyRewardClaimed ?? false) || claimedThisSessionRef.current;
      if (claimed) claimedThisSessionRef.current = true;
      setHasDailyRewardClaimed(claimed);
      setHasJournalEntry(status.hasJournalEntry ?? false);
      setStreakCount(status.streakCount ?? 0);
      setCoinsBalance(status.coinsBalance ?? 0);
      const currentUser = useAuthStore.getState().user;
      if (currentUser && status.coinsBalance !== undefined) {
        useAuthStore.setState({
          user: {
            ...currentUser,
            coinsBalance: status.coinsBalance,
            fruitsBalance: status.fruitsBalance ?? currentUser.fruitsBalance,
            streakCount: status.streakCount ?? currentUser.streakCount,
          },
        });
      }
    } catch {
      // keep defaults if offline
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEquippedItem();
    }
  }, [isAuthenticated, fetchEquippedItem]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) return;
      loadDailyStatus();

      const interval = setInterval(() => {
        loadDailyStatus();
      }, 30_000);

      return () => clearInterval(interval);
    }, [isAuthenticated, loadDailyStatus]),
  );

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
    "Oddychaj. Wszystko po kolei.",
    "Nawet mała refleksja ma znaczenie.",
    "To, że próbujesz, już jest ważne.",
  ];

  const thoughtOfTheDay =
    cloudThoughts[new Date().getDate() % cloudThoughts.length];
  const progress = dailyProgress;
  // Reward available only when user has a diary entry today and hasn't claimed yet
  const isReady = hasJournalEntry && !hasDailyRewardClaimed;

  const handleStreakCardPress = () => {
    if (!hasJournalEntry) {
      setShowStreakInfo("noEntry");
    } else if (hasDailyRewardClaimed) {
      setShowStreakInfo("claimed");
    } else if (isReady) {
      setShowFruitModal(true);
    }
  };

  const handleOdbierzPress = () => {
    setShowFruitModal(true);
  };

  const openAppleSuccess = () => {
    appleCardScale.setValue(0.72);
    appleCardOpacity.setValue(0);
    appleFloat.setValue(0);
    setShowAppleSuccess(true);
    Animated.parallel([
      Animated.spring(appleCardScale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
      Animated.timing(appleCardOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(appleFloat, { toValue: -8, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(appleFloat, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  };

  const closeAppleSuccess = () => {
    appleFloat.stopAnimation();
    appleFloat.setValue(0);
    setShowAppleSuccess(false);
  };

  const handleClaimDailyFruit = async () => {
    setIsClaimingFruit(true);
    try {
      await streakApi.claimDailyReward("fruit");
      claimedThisSessionRef.current = true;
      setHasDailyRewardClaimed(true);
      setShowFruitModal(false);
      await loadDailyStatus();
      openAppleSuccess();
    } catch {
      useToastStore.getState().show("Ups!", "Nie udało się odebrać jabłka. Spróbuj ponownie.", "error");
    } finally {
      setIsClaimingFruit(false);
    }
  };

  const handleClaimDailyCoins = async () => {
    setIsClaimingFruit(true);
    try {
      await streakApi.claimDailyReward("coins");
      claimedThisSessionRef.current = true;
      setHasDailyRewardClaimed(true);
      setShowFruitModal(false);
      await loadDailyStatus();
      useToastStore.getState().show("Monety odebrane!", "+10 monet trafiło na Twoje konto.", "success");
    } catch {
      useToastStore.getState().show("Ups!", "Nie udało się odebrać monet. Spróbuj ponownie.", "error");
    } finally {
      setIsClaimingFruit(false);
    }
  };

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
      useToastStore.getState().show("Błąd Premium", detail, "error");
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
              source={
                equippedPreviewImage || require("../../assets/images/cloud.png")
              }
              style={[
                styles.cloud,
                { transform: [{ translateY: cloudFloat }] },
              ]}
            />
            <View style={styles.header}>
              <Text style={styles.hey}>Hej!</Text>
              <Text style={styles.title}>Jak się dziś czujesz?</Text>
            </View>

            {/* DRZEWO DNIA CARD */}
            <Pressable
              style={({ pressed }) => [cardStyles.card, styles.statusCard, pressed && { opacity: 0.88 }]}
              onPress={handleStreakCardPress}
            >
              <View style={styles.compactStreakRow}>
                <View style={styles.dailyTreeWrap}>
                  <Image
                    source={DAILY_TREE_IMAGES[progress] ?? DAILY_TREE_IMAGES[0]}
                    style={styles.dailyTree}
                    resizeMode="contain"
                    fadeDuration={0}
                  />
                  {progress === 2 && (
                    <Image
                      source={require("../../assets/images/fruit.png")}
                      style={styles.dailyTreeFruit}
                      resizeMode="contain"
                    />
                  )}
                </View>

                <View style={styles.compactStreakContent}>
                  <View style={styles.compactStreakTop}>
                    <View style={styles.compactTitleRow}>
                      <Text style={styles.compactTitle}>Drzewo Dnia</Text>
                      {streakCount > 0 && (
                        <View style={styles.streakChip}>
                          <Text style={styles.streakChipText}>
                            🔥 {streakCount}
                          </Text>
                        </View>
                      )}
                    </View>
                    {isReady ? (
                      <Pressable
                        style={[
                          styles.claimFruitMiniButton,
                          isClaimingFruit && { opacity: 0.6 },
                        ]}
                        onPress={handleOdbierzPress}
                        disabled={isClaimingFruit}
                      >
                        <Text style={styles.claimFruitMiniText}>
                          Odbierz 🍎
                        </Text>
                      </Pressable>
                    ) : hasDailyFruitUsed ? (
                      <Text style={styles.compactDone}>✓ Użyto dziś</Text>
                    ) : hasJournalEntry ? (
                      <Text style={styles.compactDone}>✓ Odebrano</Text>
                    ) : (
                      <Text style={styles.compactProgress}>0/1</Text>
                    )}
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: hasJournalEntry ? "100%" : "0%" },
                      ]}
                    />
                  </View>
                  <Text style={styles.compactSubtitle}>
                    Dodaj wpis do dziennika
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Tiles row */}
            <View style={styles.tilesRow}>
              <UniverseTile
                label="Wszechświat"
                sub="Zapytaj chmurkę"
                iconBg="rgba(182,182,230,0.4)"
                onPress={handleOracleOpen}
              />
              <Tile
                icon="sparkles-outline"
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
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  cardStyles.card,
                  styles.extraCard,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => router.push("/psychotype")}
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

            <Text style={styles.fruitModalTitle}>Dzienna nagroda!</Text>
            <Text style={styles.fruitModalText}>Co chcesz odebrać?</Text>

            <Pressable
              style={[
                styles.fruitModalPlantButton,
                isClaimingFruit && { opacity: 0.6 },
              ]}
              onPress={handleClaimDailyFruit}
              disabled={isClaimingFruit}
            >
              <Text style={styles.fruitModalPlantText}>Odbierz jabłko 🍎</Text>
            </Pressable>

            <Pressable
              style={[
                styles.fruitModalExchangeButton,
                isClaimingFruit && { opacity: 0.6 },
              ]}
              onPress={handleClaimDailyCoins}
              disabled={isClaimingFruit}
            >
              <Text style={styles.fruitModalExchangeText}>
                Odbierz 10 monet 🪙
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* Apple claimed success modal */}
      <Modal
        visible={showAppleSuccess}
        transparent
        animationType="none"
        onRequestClose={closeAppleSuccess}
        statusBarTranslucent
      >
        <View style={styles.appleSuccessBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeAppleSuccess} />
          <Animated.View
            style={[
              styles.appleSuccessCard,
              { transform: [{ scale: appleCardScale }], opacity: appleCardOpacity },
            ]}
          >
            <Animated.Text
              style={[styles.appleEmoji, { transform: [{ translateY: appleFloat }] }]}
            >
              🍎
            </Animated.Text>
            <Text style={styles.appleSuccessTitle}>Jabłko odebrane!</Text>
            <Text style={styles.appleSuccessDesc}>
              Trafiło na Twoje konto.{"\n"}Zasadź je w ogródku i wyhoduj drzewo.
            </Text>
            <Pressable
              style={styles.appleSuccessPrimary}
              onPress={() => {
                closeAppleSuccess();
                router.push("../garden");
              }}
            >
              <Text style={styles.appleSuccessPrimaryText}>Idź do ogródka 🌳</Text>
            </Pressable>
            <Pressable style={styles.appleSuccessSecondary} onPress={closeAppleSuccess}>
              <Text style={styles.appleSuccessSecondaryText}>Zamknij</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        visible={showStreakInfo !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStreakInfo(null)}
      >
        <View style={styles.fruitModalRoot}>
          <Pressable
            style={styles.fruitModalBackdrop}
            onPress={() => setShowStreakInfo(null)}
          />
          <View style={styles.fruitModalCard}>
            {showStreakInfo === "noEntry" ? (
              <>
                <Text style={styles.streakInfoEmoji}>🌱</Text>
                <Text style={styles.fruitModalTitle}>Drzewo czeka</Text>
                <Text style={styles.streakInfoText}>
                  Napisz wpis w dzienniku, aby podlać swoje drzewo dnia i odebrać nagrodę.
                </Text>
                <Pressable
                  style={styles.streakInfoPrimaryBtn}
                  onPress={() => {
                    setShowStreakInfo(null);
                    router.push("/(tabs)/diary");
                  }}
                >
                  <Text style={styles.streakInfoPrimaryText}>Idź do dziennika →</Text>
                </Pressable>
                <Pressable
                  style={styles.streakInfoSecondaryBtn}
                  onPress={() => setShowStreakInfo(null)}
                >
                  <Text style={styles.streakInfoSecondaryText}>Zamknij</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.streakInfoEmoji}>✅</Text>
                <Text style={styles.fruitModalTitle}>Odebrano!</Text>
                <Text style={styles.streakInfoText}>
                  Dzienna nagroda została już odebrana. Wróć jutro, żeby podlać drzewo ponownie!
                </Text>
                <Pressable
                  style={styles.streakInfoPrimaryBtn}
                  onPress={() => setShowStreakInfo(null)}
                >
                  <Text style={styles.streakInfoPrimaryText}>OK</Text>
                </Pressable>
              </>
            )}
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
                source={
                  equippedPreviewImage ||
                  require("../../assets/images/cloud.png")
                }
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
}: {
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
        <Ionicons name="planet-outline" size={22} color={colors.text.primary} />
      </View>
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

  compactTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  streakChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(255,180,60,0.18)",
  },

  streakChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#b36a00",
  },

  compactFruit: {
    width: 54,
    height: 54,
    resizeMode: "contain",
  },

  dailyTreeWrap: {
    width: 62,
    height: 72,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  dailyTree: {
    width: 62,
    height: 62,
  },

  dailyTreeFruit: {
    position: "absolute",
    top: 0,
    right: -4,
    width: 22,
    height: 22,
  },

  compactDone: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(111,174,122,0.85)",
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
    paddingHorizontal: 10,
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
  streakInfoEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },

  streakInfoText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  streakInfoPrimaryBtn: {
    width: "100%",
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.text.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  streakInfoPrimaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },

  streakInfoSecondaryBtn: {
    width: "100%",
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(70,80,90,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  streakInfoSecondaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },

  star: {
    position: "absolute",
    color: "rgba(80,100,160,0.65)",
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

  appleSuccessBackdrop: {
    flex: 1,
    backgroundColor: "rgba(20, 30, 50, 0.58)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  appleSuccessCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#375a85",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  appleEmoji: {
    fontSize: 66,
    marginBottom: 16,
  },
  appleSuccessTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  appleSuccessDesc: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  appleSuccessPrimary: {
    width: "100%",
    height: 50,
    borderRadius: 999,
    backgroundColor: colors.text.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: colors.text.primary,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  appleSuccessPrimaryText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },
  appleSuccessSecondary: {
    width: "100%",
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(70,80,90,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  appleSuccessSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.secondary,
  },
});
