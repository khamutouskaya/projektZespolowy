import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/theme/colors";

export default function PlannerEmptyState() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const iconFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloatAnim, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(iconFloatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Animated.View style={{ transform: [{ translateY: iconFloatAnim }] }}>
        <Ionicons
          name="checkmark-circle-outline"
          size={64}
          color={colors.text.quaternary}
        />
      </Animated.View>
      <Text style={styles.title}>Nic na dziś</Text>
      <Text style={styles.subtitle}>Dodaj zadanie, aby zacząć swój dzień</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.secondary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#8f9296",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
