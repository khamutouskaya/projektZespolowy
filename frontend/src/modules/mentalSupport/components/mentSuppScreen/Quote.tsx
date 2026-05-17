import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, StyleSheet } from "react-native";
import { typography } from "@/shared/theme/typography";

import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";
import { mentalSupportQuotes } from "@/shared/constants/quotes";

export default function Quote() {
  const quotes = mentalSupportQuotes;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const randomQuote = useRef(
    quotes[Math.floor(Math.random() * quotes.length)],
  ).current;

  const animatePressScale = (toValue: number) => {
    Animated.spring(pressScale, {
      toValue,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 85,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, scale]);

  return (
    <Pressable
      onPressIn={() => animatePressScale(1.04)}
      onPressOut={() => animatePressScale(1)}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [
              { translateY },
              { scale: Animated.multiply(scale, pressScale) },
            ],
          },
        ]}
      >
        <Text style={styles.quote}>{randomQuote}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    padding: spacing.md,
    //marginTop: spacing.lg,
    minHeight: 100,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1.5,
    borderColor: "#d0c8da",
  },

  quote: {
    ...typography.title,
    color: colors.text.primary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
