import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/shared/theme/colors";

type Props = {
  title: string;
  onClearPress?: () => void;
  clearDisabled?: boolean;
  scrolled?: boolean;
};

export function AssistantHeader({
  title,
  onClearPress,
  clearDisabled = false,
  scrolled = false,
}: Props) {
  const borderOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderOpacity, {
      toValue: scrolled ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [scrolled]);

  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.iconButton, clearDisabled && styles.iconButtonDisabled]}
          onPress={onClearPress}
          disabled={clearDisabled}
          accessibilityRole="button"
          accessibilityLabel="Wyczyść czat"
        >
          <Ionicons name="create-outline" size={30} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.placeholder} />
      </View>
      <Animated.View style={[styles.border, { opacity: borderOpacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
    minHeight: 36,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  iconButtonDisabled: {
    opacity: 0.35,
  },
  title: {
    position: "absolute",
    left: 48,
    right: 48,
    fontSize: 28,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
  },
  placeholder: {
    width: 0,
    height: 0,
  },
  border: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "hsla(295, 6%, 38%, 0.50)",
  },
});
