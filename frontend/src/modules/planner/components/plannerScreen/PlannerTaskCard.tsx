import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Reanimated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Ionicons } from "@expo/vector-icons";
import { PlannerTask } from "@/modules/planner/planner.types";
import { colors } from "@/shared/theme/colors";
import { cardStyles } from "@/shared/theme/styles";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Props = {
  task: PlannerTask;
  onPress: () => void;
  onToggleComplete: () => void;
  onToggleImportant: () => void;
  onDelete: () => void;
  isCompletedCard?: boolean;
  index?: number;
  scrollOffset?: SharedValue<number>;
};

export default function PlannerTaskCard({
  task,
  onPress,
  onToggleComplete,
  onToggleImportant,
  onDelete,
  isCompletedCard = false,
  index = 0,
  scrollOffset,
}: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const trimmedNote = task.note.trim();

  const swipeableRef = useRef<Swipeable | null>(null);

  // RN Animated – complete / delete / strike / press
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressScaleAnim = useRef(new Animated.Value(1)).current;
  const strikeAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;
  const marginAnim = useRef(new Animated.Value(15)).current;

  // Reanimated – entry slide-in + scroll depth
  const layoutY = useSharedValue(0);
  const entryProgress = useSharedValue(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    entryProgress.value = withDelay(
      index * 55,
      withSpring(1, { mass: 0.5, stiffness: 200, damping: 22 }),
    );
  }, []);

  const liveStyle = useAnimatedStyle(() => {
    // Entry: slide from left + fade in
    const entryOpacity = entryProgress.value;
    const entryX = interpolate(
      entryProgress.value,
      [0, 1],
      [-30, 0],
      Extrapolation.CLAMP,
    );

    // Depth: cards near viewport edges shrink + dim
    let depthScale = 1;
    let depthOpacity = 1;
    if (scrollOffset) {
      const cardScreenCenter = layoutY.value + 38 - scrollOffset.value;
      const viewportCenter = SCREEN_HEIGHT / 2 - 60;
      const dist = Math.abs(cardScreenCenter - viewportCenter);
      depthScale = interpolate(
        dist,
        [0, 150, SCREEN_HEIGHT * 0.52],
        [1, 1, 0.94],
        Extrapolation.CLAMP,
      );
      depthOpacity = interpolate(
        dist,
        [110, SCREEN_HEIGHT * 0.44],
        [1, 0.72],
        Extrapolation.CLAMP,
      );
    }

    return {
      opacity: entryOpacity * depthOpacity,
      transform: [{ translateX: entryX }, { scale: depthScale }],
    };
  });

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
      `Zadanie „${task.title}" zostanie usunięte.`,
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
      ],
    );
  };

  const handlePressIn = () => {
    if (isAnimating || isDeleting) return;
    Animated.spring(pressScaleAnim, {
      toValue: 1.038,
      useNativeDriver: true,
      speed: 60,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 5,
    }).start();
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
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  };

  const strikeWidth = strikeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const metaItems = [
    task.category
      ? {
          key: "category",
          text: task.category,
        }
      : null,
    trimmedNote.length > 0
      ? {
          key: "note",
          text: "Notatka",
          iconName: "document-text-outline" as const,
        }
      : null,
    task.date
      ? {
          key: "date",
          text: formatTaskDate(task.date),
          iconName: "calendar-outline" as const,
        }
      : null,
    task.reminderDate
      ? {
          key: "reminder",
          text: formatReminderDate(task.reminderDate),
          iconName: "notifications-outline" as const,
        }
      : null,
  ].filter(
    (
      item,
    ): item is {
      key: string;
      text: string;
      iconName?:
        | "document-text-outline"
        | "calendar-outline"
        | "notifications-outline";
    } => item !== null,
  );

  return (
    <Reanimated.View
      style={[styles.liveWrapper, liveStyle]}
      onLayout={(e) => {
        layoutY.value = e.nativeEvent.layout.y;
      }}
    >
      <Animated.View
        style={{
          height:
            isCompleting || isDeleting
              ? heightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 100],
                })
              : undefined,
          overflow: "visible",
          marginBottom: marginAnim,
        }}
      >
        <Swipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          overshootRight={false}
          overshootFriction={8}
          containerStyle={{ overflow: "visible" }}
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
                  { scale: pressScaleAnim },
                ],
              },
            ]}
          >
            <Pressable
              onPress={handleCompletePress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.leftSide}
            >
              <Ionicons
                name={isCompletedCard ? "checkmark-circle" : "ellipse-outline"}
                size={28}
                color={colors.text.secondary}
              />
            </Pressable>

            <Pressable
              onPress={onPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.center}
              disabled={isAnimating || isDeleting}
            >
              <View style={styles.titleWrap}>
                <Text
                  style={[
                    styles.title,
                    isCompletedCard && styles.completedTitle,
                  ]}
                >
                  {task.title}
                </Text>

                <Animated.View
                  pointerEvents="none"
                  style={[styles.strikeLine, { width: strikeWidth }]}
                />
              </View>

              {metaItems.length > 0 && (
                <View style={styles.metaRow}>
                  {metaItems.map((item) => (
                    <View key={item.key} style={styles.metaItem}>
                      <Text style={styles.dot}>•</Text>
                      {item.iconName && (
                        <Ionicons
                          name={item.iconName}
                          size={15}
                          color={colors.text.secondary}
                        />
                      )}
                      <Text style={styles.subtitle}>{item.text}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={onToggleImportant}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.rightSide}
              disabled={isAnimating || isDeleting}
            >
              <Ionicons
                name={task.important ? "star" : "star-outline"}
                size={24}
                color={task.important ? "#E7B85C" : colors.text.secondary}
              />
            </Pressable>
          </Animated.View>
        </Swipeable>
      </Animated.View>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  liveWrapper: {
    overflow: "visible",
  },
  card: {
    width: "100%",
    minHeight: 76,
    ...cardStyles.card,
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
    color: colors.text.secondary,
  },
  strikeLine: {
    position: "absolute",
    left: 0,
    top: "52%",
    height: 2,
    backgroundColor: colors.text.secondary,
    borderRadius: 999,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  dot: {
    fontSize: 14,
    color: colors.text.secondary,
    marginHorizontal: 2,
  },
  rightSide: {
    marginLeft: 10,
  },
  rightActionWrap: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
  },
  deleteAction: {
    //flex: 1,
    width: 70,
    height: 75,
    borderRadius: 20,
    backgroundColor: "#FF3B47",
    alignItems: "center",
    justifyContent: "center",
  },
});
