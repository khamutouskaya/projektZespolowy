import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";

type Props = {
  onPress: () => void;
};

export default function PlannerAddBar({ onPress }: Props) {
  const idleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(idleAnim, {
          toValue: 1,
          duration: 1900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(idleAnim, {
          toValue: 0,
          duration: 1900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [idleAnim]);

  const barAnimatedStyle = {
    transform: [
      {
        translateY: idleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -2],
        }),
      },
      {
        scale: idleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.012],
        }),
      },
    ],
  };

  const iconAnimatedStyle = {
    transform: [
      {
        scale: idleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.08],
        }),
      },
      {
        rotate: idleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "5deg"],
        }),
      },
    ],
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <Animated.View style={[styles.bar, barAnimatedStyle]}>
        <View style={styles.content}>
          <Animated.View style={iconAnimatedStyle}>
            <Ionicons name="add-circle" size={28} color={colors.text.primary} />
          </Animated.View>
          <Text style={styles.text}>Dodaj zadanie</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },
  bar: {
    minHeight: 76,
    borderRadius: 24,
    backgroundColor: colors.background.glass,
    paddingHorizontal: 20,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.text.quaternary,
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pressed: {
    opacity: 0.88,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  text: {
    ...typography.title,
    color: colors.text.primary,
  },
});
