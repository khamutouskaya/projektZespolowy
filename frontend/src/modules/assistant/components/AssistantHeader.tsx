import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/shared/theme/colors";

type Props = {
  title: string;
  onClearPress?: () => void;
  clearDisabled?: boolean;
  scrolled?: boolean;
  onMenuPress?: () => void;
  personalityEmoji?: string;
};

export function AssistantHeader({
  title,
  onClearPress,
  clearDisabled = false,
  scrolled = false,
  onMenuPress,
  personalityEmoji,
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
        {/* Hamburger menu — left */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onMenuPress}
          accessibilityRole="button"
          accessibilityLabel="Styl rozmowy"
        >
          {personalityEmoji ? (
            <Text style={styles.personalityEmoji}>{personalityEmoji}</Text>
          ) : (
            <View style={styles.hamburger}>
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        {/* Clear chat — right */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            clearDisabled && styles.iconButtonDisabled,
          ]}
          onPress={onClearPress}
          disabled={clearDisabled}
          accessibilityRole="button"
          accessibilityLabel="Wyczyść czat"
        >
          <Ionicons
            name="create-outline"
            size={30}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      </View>
      <Animated.View style={[styles.border, { opacity: borderOpacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 10,
    minHeight: 44,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonDisabled: {
    opacity: 0.35,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "800",
    color: colors.text.primary,
    textAlign: "center",
  },
  hamburger: {
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.text.primary,
  },
  personalityEmoji: {
    fontSize: 22,
  },
  border: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "hsla(295, 6%, 38%, 0.50)",
  },
});
