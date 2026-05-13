import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Modal, StyleSheet, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { colors } from "@/shared/theme/colors";
import { mentalSupportQuotes } from "@/shared/constants/quotes";

type Props = {
  visible: boolean;
};

function PulseDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return <Animated.View style={[styles.dot, { opacity: anim }]} />;
}

export default function SummaryLoadingOverlay({ visible }: Props) {
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const cloudFloat = useRef(new Animated.Value(0)).current;
  const cloudPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    setThoughtIndex(0);
    fadeAnim.setValue(1);
    cloudFloat.setValue(0);
    cloudPulse.setValue(1);

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudFloat, { toValue: -10, duration: 1800, useNativeDriver: true }),
        Animated.timing(cloudFloat, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    floatLoop.start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudPulse, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(cloudPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        setThoughtIndex((i) => (i + 1) % mentalSupportQuotes.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      floatLoop.stop();
      pulseLoop.stop();
    };
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <BlurView intensity={55} tint="light" style={styles.overlay}>
        <View style={styles.card}>
          <Animated.Image
            source={require("../../../../../assets/images/cloud.png")}
            style={[styles.cloudImage, { transform: [{ translateY: cloudFloat }, { scale: cloudPulse }] }]}
          />

          <Text style={styles.title}>Generuję podsumowanie…</Text>

          <View style={styles.thoughtBox}>
            <Animated.Text style={[styles.thought, { opacity: fadeAnim }]}>
              {`“${mentalSupportQuotes[thoughtIndex]}”`}
            </Animated.Text>
          </View>

          <View style={styles.dotsRow}>
            <PulseDot delay={0} />
            <PulseDot delay={200} />
            <PulseDot delay={400} />
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.93)",
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "78%",
    shadowColor: "#5f5c5c",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
    gap: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  thoughtBox: {
    minHeight: 66,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  thought: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 22,
  },
  cloudImage: {
    width: 120,
    height: 115,
    resizeMode: "contain",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.primary,
  },
});
