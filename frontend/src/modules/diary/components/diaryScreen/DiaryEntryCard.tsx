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
import { useRouter } from "expo-router";
import { DiaryEntry } from "../../diary.types";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { cardStyles } from "@/shared/theme/styles";

type Props = {
  entry: DiaryEntry;
  onDelete: (id: string) => void;
  isLast?: boolean;
};
const TAG_MAP: Record<string, string> = {
  Spokój: "💙",
  Relaks: "🌿",
  Energia: "⭐",
  Produktywność: "🚀",
  Radość: "🌞",
  Zmęczenie: "😴",
}; //NOTE: jesli jest to zmieniane, to nalezy tez to uwzglednic w TagSelector (w diaryNote)

const DEFAULT_ICON = "📝";

const DEFAULT_CARD_HEIGHT = 128;
const CARD_SPACING = 10;

const parseTags = (tags?: string): string[] => {
  if (!tags) return [];

  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === "string")
      : [];
  } catch {
    return [];
  }
};

export default function DiaryEntryCard({
  entry,
  onDelete,
  isLast = false,
}: Props) {
  const router = useRouter();
  const swipeableRef = useRef<Swipeable | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cardHeight, setCardHeight] = useState(DEFAULT_CARD_HEIGHT);
  const title = entry.title?.trim() || entry.date;
  const tags = parseTags(entry.tags);
  const newlineIdx = entry.content?.indexOf("\n") ?? -1;
  const bodyText = newlineIdx !== -1 ? entry.content.slice(newlineIdx + 1).trim() : "";

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(1)).current;
  const marginAnim = useRef(
    new Animated.Value(isLast ? 0 : CARD_SPACING),
  ).current;

  useEffect(() => {
    if (!isDeleting) {
      marginAnim.setValue(isLast ? 0 : CARD_SPACING);
    }
  }, [isDeleting, isLast, marginAnim]);

  const runDeleteAnimation = () => {
    if (isDeleting) return;

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
      onDelete(entry.id);
    });
  };

  const confirmDelete = () => {
    Alert.alert("Usunac wpis?", `Wpis "${title}" zostanie usuniety.`, [
      {
        text: "Anuluj",
        style: "cancel",
        onPress: () => swipeableRef.current?.close(),
      },
      {
        text: "Usun",
        style: "destructive",
        onPress: () => {
          swipeableRef.current?.close();
          setTimeout(() => {
            runDeleteAnimation();
          }, 90);
        },
      },
    ]);
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

  return (
    <Animated.View
      style={{
        height: isDeleting
          ? heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.max(cardHeight, DEFAULT_CARD_HEIGHT)],
            })
          : undefined,
        marginBottom: marginAnim,
        overflow: isDeleting ? "hidden" : "visible",
      }}
    >
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        overshootFriction={8}
        containerStyle={{ overflow: "hidden" }}
        childrenContainerStyle={{ overflow: "visible" }}
        enabled={!isDeleting}
      >
        <Pressable
          onPress={() => router.push(`/(tabs)/diary/note?id=${entry.id}`)}
          disabled={isDeleting}
        >
          {({ pressed }) => (
            <Animated.View
              onLayout={(event) => {
                const nextHeight = event.nativeEvent.layout.height;
                if (
                  nextHeight > 0 &&
                  !isDeleting &&
                  Math.abs(nextHeight - cardHeight) > 1
                ) {
                  setCardHeight(nextHeight);
                }
              }}
              style={[
                cardStyles.card,
                styles.card,
                pressed && styles.cardPressed,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateX: translateXAnim },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              <View style={styles.header}>
                <Text style={styles.icon}>{entry.icon || DEFAULT_ICON}</Text>

                <Text style={styles.title}>{title}</Text>
              </View>

              {bodyText ? (
                <Text style={styles.preview} numberOfLines={2}>
                  {bodyText}
                </Text>
              ) : null}

              <View style={styles.footer}>
                <Text style={styles.meta}>
                  {entry.date} {entry.duration ? `~ ${entry.duration}` : ""}
                </Text>

                {tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    {tags.map((label) => (
                      <Text key={label} style={styles.tag}>
                        {TAG_MAP[label] ?? ""} {label}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </Animated.View>
          )}
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  cardPressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(70,80,90,0.75)",
  },

  icon: {
    fontSize: 26,
  },

  title: {
    ...typography.title,
    color: colors.text.primary,
  },

  preview: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 8,
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
  },

  meta: {
    flex: 1,
    ...typography.caption,
    color: colors.text.tertiary,
  },

  tagLabel: {
    ...typography.caption,
    color: colors.text.primary,
    marginLeft: 12,
  },

  summary: {
    fontSize: 13,
    color: "rgba(70,80,90,0.6)",
    marginBottom: 6,
    fontStyle: "italic",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(173,219,183,0.35)",
    color: "rgba(70,80,90,0.75)",
    fontWeight: "600",
  },
  rightActionWrap: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
  },
  deleteAction: {
    width: 70,
    height: 75,
    borderRadius: 20,
    backgroundColor: "#FF3B47",
    alignItems: "center",
    justifyContent: "center",
  },
});
