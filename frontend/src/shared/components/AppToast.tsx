import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/shared/theme/colors";
import { ToastType, useToastStore } from "@/services/store/useToastStore";

const TYPE_CONFIG: Record<ToastType, { icon: any; color: string; bg: string }> = {
  success: {
    icon: "checkmark-circle",
    color: "#4f7f58",
    bg: "rgba(111,174,122,0.14)",
  },
  error: {
    icon: "alert-circle",
    color: "#b83232",
    bg: "rgba(184,50,50,0.10)",
  },
  info: {
    icon: "information-circle",
    color: colors.text.primary,
    bg: "rgba(55,90,133,0.10)",
  },
};

export default function AppToast() {
  const { visible, type, title, message, hide } = useToastStore();

  const slideAnim = useRef(new Animated.Value(90)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 68,
          friction: 11,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 190,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 90,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const cfg = TYPE_CONFIG[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Pressable style={styles.card} onPress={hide}>
        <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={24} color={cfg.color} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
        <Ionicons name="close" size={16} color="rgba(90,100,110,0.4)" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 106,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#5f5c5c",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
  },
  message: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
