import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DiaryEntry } from "../../diary.types";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import DiaryEntryCard from "./DiaryEntryCard";

type EmptyConfig = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  hint?: string;
};

type Props = {
  title: string;
  entries: DiaryEntry[];
  onDeleteEntry: (id: string) => void;
  emptyPlaceholder?: EmptyConfig;
};

function EmptyPlaceholder({ iconName, title, hint }: EmptyConfig) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.82)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

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
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
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
        styles.emptyContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <Ionicons name={iconName} size={55} color="#a0aab8" />
      </Animated.View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
    </Animated.View>
  );
}

export default function DiaryEntriesSection({
  title,
  entries,
  onDeleteEntry,
  emptyPlaceholder,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}:</Text>

      {entries.length === 0 && emptyPlaceholder ? (
        <EmptyPlaceholder {...emptyPlaceholder} />
      ) : (
        <View style={styles.list}>
          {entries.map((entry, index) => (
            <DiaryEntryCard
              key={entry.id}
              entry={entry}
              onDelete={onDeleteEntry}
              isLast={index === entries.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  title: {
    ...typography.title,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  list: {},
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.secondary,
    marginTop: 8,
  },
  emptyHint: {
    fontSize: 15,
    color: "#8f9296",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
