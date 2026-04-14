import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons } from "@expo/vector-icons";
import { PlannerTask } from "@/modules/planner/planner.types";
import { colors } from "@/shared/theme/colors";

type Props = {
  task: PlannerTask;
  onPress: () => void;
  onToggleComplete: () => void;
  onToggleImportant: () => void;
  onDelete: () => void;
  isCompletedCard?: boolean;
};

export default function PlannerTaskCard({
  task,
  onPress,
  onToggleComplete,
  onToggleImportant,
  onDelete,
  isCompletedCard = false,
}: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const swipeableRef = useRef<Swipeable | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const strikeAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;
  const marginAnim = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    if (isCompletedCard || task.completed) {
      Animated.timing(strikeAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [isCompletedCard, task.completed, strikeAnim]);

  const formatTaskDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatReminderDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("pl-PL", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }) +
      " " +
      date.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const runDeleteAnimation = () => {
    if (isDeleting || isAnimating) return;

    setIsDeleting(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: -18,
        duration: 360,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.99,
        duration: 360,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(marginAnim, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      onDelete();
    });
  };

  const confirmDelete = () => {
    Alert.alert(
      "Usunąć zadanie?",
      `Zadanie „${task.title}” zostanie usunięte.`,
      [
        {
          text: "Anuluj",
          style: "cancel",
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: "Usuń",
          style: "destructive",
          onPress: () => {
            swipeableRef.current?.close();
            setTimeout(() => {
              runDeleteAnimation();
            }, 90);
          },
        },
      ]
    );
  };

  const handleCompletePress = () => {
    if (isAnimating || isDeleting) return;

    if (isCompletedCard) {
      onToggleComplete();
      return;
    }

    setIsAnimating(true);
    setIsCompleting(true);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(strikeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.78,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 380,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 12,
          duration: 380,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.99,
          duration: 380,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(marginAnim, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      onToggleComplete();
    });
  };

  const renderRightActions = () => {
    return (
      <View style={styles.rightActionWrap}>
        <Pressable style={styles.deleteAction} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={28} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  };

  const strikeWidth = strikeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={{
        height: heightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 100],
        }),
        marginBottom: marginAnim,
        overflow: isCompleting || isDeleting ? "hidden" : "visible",
      }}
    >
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        enabled={!isCompleting && !isDeleting}
      >
        <Animated.View
          style={[
            styles.card,
            isCompletedCard && styles.completedCard,
            isCompleting && styles.completingCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: translateYAnim },
                { translateX: translateXAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Pressable onPress={handleCompletePress} style={styles.leftSide}>
            <Ionicons
              name={isCompletedCard ? "checkmark-circle" : "ellipse-outline"}
              size={28}
              color="rgba(111,122,134,0.82)"
            />
          </Pressable>

          <Pressable
            onPress={onPress}
            style={styles.center}
            disabled={isAnimating || isDeleting}
          >
            <View style={styles.titleWrap}>
              <Text
                style={[styles.title, isCompletedCard && styles.completedTitle]}
              >
                {task.title}
              </Text>

              <Animated.View
                pointerEvents="none"
                style={[styles.strikeLine, { width: strikeWidth }]}
              />
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.subtitle}>Zadanie</Text>

              {task.category && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.subtitle}>{task.category}</Text>
                </>
              )}

              {task.note.trim().length > 0 && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <Ionicons
                    name="document-text-outline"
                    size={15}
                    color="rgba(111,122,134,0.76)"
                  />
                  <Text style={styles.subtitle}>Notatka</Text>
                </>
              )}

              {task.date && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color="rgba(111,122,134,0.76)"
                  />
                  <Text style={styles.subtitle}>{formatTaskDate(task.date)}</Text>
                </>
              )}

              {task.reminderDate && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <Ionicons
                    name="notifications-outline"
                    size={15}
                    color="rgba(111,122,134,0.76)"
                  />
                  <Text style={styles.subtitle}>
                    {formatReminderDate(task.reminderDate)}
                  </Text>
                </>
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={onToggleImportant}
            style={styles.rightSide}
            disabled={isAnimating || isDeleting}
          >
            <Ionicons
              name={task.important ? "star" : "star-outline"}
              size={24}
              color={task.important ? "#E7B85C" : "rgba(111,122,134,0.82)"}
            />
          </Pressable>
        </Animated.View>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 86,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.88)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  completedCard: {
    opacity: 0.94,
  },
  completingCard: {
    backgroundColor: "rgba(238,242,248,0.95)",
  },
  leftSide: {
    marginRight: 14,
  },
  center: {
    flex: 1,
  },
  titleWrap: {
    position: "relative",
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
  },
  completedTitle: {
    color: "rgba(111,122,134,0.78)",
  },
  strikeLine: {
    position: "absolute",
    left: 0,
    top: "52%",
    height: 2,
    backgroundColor: "rgba(111,122,134,0.75)",
    borderRadius: 999,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
    flexWrap: "wrap",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(111,122,134,0.76)",
  },
  dot: {
    fontSize: 14,
    color: "rgba(111,122,134,0.76)",
    marginHorizontal: 2,
  },
  rightSide: {
    marginLeft: 10,
  },
  rightActionWrap: {
    width: 96,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteAction: {
    width: 84,
    height: 86,
    borderRadius: 24,
    backgroundColor: "#FF3B47",
    alignItems: "center",
    justifyContent: "center",
  },
});