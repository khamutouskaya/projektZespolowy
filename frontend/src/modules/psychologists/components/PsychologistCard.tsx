import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";
import { cardStyles } from "@/shared/theme/styles";
import { typography } from "@/shared/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Psychologist } from "../psychologists.types";

interface Props {
  psychologist: Psychologist;
  onPress: () => void;
}

export default function PsychologistCard({ psychologist, onPress }: Props) {
  const {
    firstName,
    lastName,
    title,
    specialty,
    rating,
    reviewsCount,
    pricePerSession,
    experience,
    specializations,
    avatarColor,
    nextAvailable,
    availableToday,
  } = psychologist;

  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <Pressable
      style={({ pressed }) => [
        cardStyles.card,
        styles.card,
        pressed && { opacity: 0.88 },
      ]}
      onPress={onPress}
    >
      <View style={styles.row}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.initials}>{initials}</Text>
        </View>

        {/* Main info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {title} {firstName} {lastName}
            </Text>
            {availableToday && (
              <View style={styles.availablePill}>
                <View style={styles.greenDot} />
                <Text style={styles.availableText}>Dziś</Text>
              </View>
            )}
          </View>
          <Text style={styles.specialty} numberOfLines={1}>
            {specialty}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#f5a623" />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({reviewsCount})</Text>
            </View>
            <View style={styles.dot} />
            <Text style={styles.experience}>
              {experience} lat doświadczenia
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.text.quaternary}
        />
      </View>

      {/* Specialization tags */}
      <View style={styles.tagsRow}>
        {specializations.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.availabilityRow}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={colors.text.secondary}
          />
          <Text style={styles.nextAvailable}>{nextAvailable}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{pricePerSession} zł</Text>
          <Text style={styles.priceSub}> / sesja</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "92%",
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  initials: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.primary,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  name: {
    ...typography.titleSmall,
    fontWeight: "700",
    color: colors.text.primary,
  },
  availablePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(111,174,122,0.15)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6FAE7A",
  },
  availableText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4a8a55",
  },
  specialty: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.secondary,
  },
  reviewCount: {
    fontSize: 11,
    color: colors.text.quaternary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.text.quaternary,
  },
  experience: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  tagsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: "rgba(55,90,133,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.primary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(55,90,133,0.08)",
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  nextAvailable: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    ...typography.title,
    fontWeight: "700",
    color: colors.text.primary,
  },
  priceSub: {
    fontSize: 11,
    color: colors.text.secondary,
  },
});
