import LayoutContainer from "@/shared/layout/LayoutContainer";
import { cardStyles } from "@/shared/theme/styles";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Home() {
  const router = useRouter();

  const [showOracle, setShowOracle] = useState(false);
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
    "Oddychaj. Wszystko po kolei.",
    "Nawet mała refleksja ma znaczenie.",
    "To, że próbujesz, już jest ważne.",
  ];

  const thoughtOfTheDay =
    cloudThoughts[new Date().getDate() % cloudThoughts.length];

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

          <Animated.Image
            source={require("../../assets/images/cloud.png")}
            style={[styles.cloud, { transform: [{ translateY: cloudFloat }] }]}
          />
          <View style={styles.header}>
            <Text style={styles.hey}>Hej!</Text>
            <Text style={styles.title}>Jak się dziś czujesz?</Text>
          </View>

          {/* Status card */}
          <View style={[cardStyles.card, styles.statusCard]}>
            <Text style={styles.sectionLabel}>Twój stan emocjonalny</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>2 dni z rzędu</Text>
              <View style={styles.dot} />
              <Text style={styles.statusText}>Dobra ciągłość</Text>
              <View style={styles.sproutWrap}>
                <Ionicons name="leaf" size={15} color="#6FAE7A" />
              </View>
            </View>
          </View>

          {/* Tiles row */}
          <View style={styles.tilesRow}>
            <UniverseTile
              label={"Wszechświat"}
              onPress={handleOracleOpen}
              glowAnim={tileGlow}
            />
            <Tile
              icon="diamond-outline"
              label="Akcesoria"
              onPress={() => router.push("../accessories")}
            />
            <Tile
              icon="flower-outline"
              label="Ogródek"
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
        </Animated.View>
      </LayoutContainer>

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
  onPress,
  glowAnim,
}: {
  label: string;
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
      <Animated.View style={{ transform: [{ scale: glowAnim }] }}>
        <Ionicons name="planet-outline" size={26} color={colors.text.primary} />
      </Animated.View>
      <Text style={styles.tileText}>{label}</Text>
    </Pressable>
  );
}

function Tile({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
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
      <Ionicons name={icon} size={26} color={colors.text.primary} />
      <Text style={styles.tileText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 110,
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
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  tileText: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },

  thoughtCard: {
    width: "92%",
    marginTop: spacing.md,
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
  },

  bottomText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(70,80,90,0.78)",
    flexShrink: 1,
    lineHeight: 22,
  },

  thoughtCard: {
    width: "92%",
    marginTop: spacing.md,
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

  star: {
    position: "absolute",
    color: "rgba(80,100,160,0.65)",
  },
});
