import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "@/shared/theme/colors";
import { RewardType, useRewardModalStore } from "@/services/store/useRewardModalStore";

const REWARD_CONFIG: Record<RewardType, { emoji: string; title: string; desc: string }> = {
  note: {
    emoji: "📖",
    title: "Pierwsza notatka!",
    desc: "Zacząłeś pisać dziennik — to ważny krok. Tak trzymaj!",
  },
  task: {
    emoji: "✅",
    title: "Pierwsze zadanie!",
    desc: "Ukończyłeś swoje pierwsze zadanie. Jesteś produktywny!",
  },
  video: {
    emoji: "🎬",
    title: "Pierwsze wideo!",
    desc: "Zainwestowałeś w siebie — oglądasz materiały wspierające.",
  },
  quiz: {
    emoji: "🧠",
    title: "Pierwszy test!",
    desc: "Poznałeś swój psychotyp. To pierwsza droga do siebie.",
  },
};

export default function WelcomeRewardModal() {
  const { visible, coinsAwarded, rewardType, hide } = useRewardModalStore();

  const scaleAnim = useRef(new Animated.Value(0.72)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const coinScale = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.72);
      opacityAnim.setValue(0);
      coinScale.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.spring(coinScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }).start();
      });

      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -7,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      floatAnim.stopAnimation();
      floatAnim.setValue(0);
    }
  }, [visible]);

  if (!rewardType) return null;

  const cfg = REWARD_CONFIG[rewardType];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={hide}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={hide} />

        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Floating emoji */}
          <Animated.Text
            style={[styles.mainEmoji, { transform: [{ translateY: floatAnim }] }]}
          >
            {cfg.emoji}
          </Animated.Text>

          <Text style={styles.title}>{cfg.title}</Text>
          <Text style={styles.desc}>{cfg.desc}</Text>

          {/* Coins badge */}
          <Animated.View
            style={[styles.coinsBadge, { transform: [{ scale: coinScale }] }]}
          >
            <Text style={styles.coinsEmoji}>🪙</Text>
            <Text style={styles.coinsText}>+{coinsAwarded} monet</Text>
          </Animated.View>

          <Text style={styles.hint}>Monety trafiły na Twoje konto.</Text>

          <Pressable style={styles.btn} onPress={hide}>
            <Text style={styles.btnText}>Super! →</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(20, 30, 50, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  card: {
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
  mainEmoji: {
    fontSize: 62,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  coinsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(249, 221, 12, 0.15)",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "rgba(249, 200, 12, 0.4)",
  },
  coinsEmoji: {
    fontSize: 22,
  },
  coinsText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#a07800",
    letterSpacing: 0.2,
  },
  hint: {
    fontSize: 12,
    color: colors.text.secondary,
    opacity: 0.6,
    marginBottom: 24,
  },
  btn: {
    width: "100%",
    height: 50,
    borderRadius: 999,
    backgroundColor: colors.text.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.text.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
