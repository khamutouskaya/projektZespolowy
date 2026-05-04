import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "@/shared/theme/colors";
import { personalities, type Personality } from "../data/personalities";

const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.78, 320);
const CLOSE_THRESHOLD = DRAWER_WIDTH * 0.35;
const VELOCITY_THRESHOLD = 0.5;

type Props = {
  visible: boolean;
  selectedId: string | null;
  onSelect: (personality: Personality) => void;
  onClose: () => void;
};

export function PersonalityDrawer({
  visible,
  selectedId,
  onSelect,
  onClose,
}: Props) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  // Keep modal mounted until close animation finishes
  const [modalVisible, setModalVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible) {
      translateX.setValue(-DRAWER_WIDTH);
      overlayOpacity.setValue(0);
      setModalVisible(true);
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 24,
          stiffness: 220,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setModalVisible(false);
      });
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        dx < -5 && Math.abs(dx) > Math.abs(dy),
      onPanResponderMove: (_, { dx }) => {
        const clampedX = Math.min(0, dx);
        translateX.setValue(clampedX);
        const progress = 1 + clampedX / DRAWER_WIDTH;
        overlayOpacity.setValue(Math.max(0, progress));
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        const shouldClose = dx < -CLOSE_THRESHOLD || vx < -VELOCITY_THRESHOLD;
        if (shouldClose) {
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -DRAWER_WIDTH,
              duration: 160,
              useNativeDriver: true,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 0,
              duration: 140,
              useNativeDriver: true,
            }),
          ]).start(({ finished }) => {
            if (finished) onCloseRef.current();
          });
        } else {
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              damping: 24,
              stiffness: 220,
            }),
            Animated.timing(overlayOpacity, {
              toValue: 1,
              duration: 120,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            damping: 24,
            stiffness: 220,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
  ).current;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Dim overlay — tap to close */}
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sliding drawer with drag-to-close */}
        <Animated.View
          style={[styles.drawer, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />

          <Text style={styles.title}>Styl rozmowy</Text>
          <Text style={styles.subtitle}>
            Wybierz, jak asystent ma się z tobą komunikować
          </Text>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {personalities.map((p) => {
              const isSelected = selectedId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => {
                    onSelect(p);
                    onClose();
                  }}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.emojiBox,
                      isSelected && styles.emojiBoxSelected,
                    ]}
                  >
                    <Text style={styles.emoji}>{p.emoji}</Text>
                  </View>
                  <View style={styles.cardBody}>
                    <Text
                      style={[
                        styles.cardName,
                        isSelected && styles.cardNameSelected,
                      ]}
                    >
                      {p.name}
                    </Text>
                    <Text style={styles.cardDesc}>{p.description}</Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#fff",
    paddingTop: 56,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8F8FA",
    borderWidth: 1.5,
    borderColor: "transparent",
    gap: 12,
  },
  cardSelected: {
    backgroundColor: "#EEF0FF",
    borderColor: "#6C63FF",
  },
  emojiBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EBEBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBoxSelected: {
    backgroundColor: "#D9D6FF",
  },
  emoji: {
    fontSize: 22,
  },
  cardBody: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 2,
  },
  cardNameSelected: {
    color: "#6C63FF",
  },
  cardDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#6C63FF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
