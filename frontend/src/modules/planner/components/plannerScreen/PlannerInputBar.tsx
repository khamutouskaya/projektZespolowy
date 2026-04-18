import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/theme/colors";
import { cardStyles } from "@/shared/theme/styles";
import PlannerDateChip from "./PlannerDateChip";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onOpenCategory: () => void;
  onOpenReminder: () => void;
  onOpenDate: () => void;
  onOpenNote: () => void;
  categoryLabel: string | null;
  dateLabel: string | null;
  reminderLabel: string | null;
  noteLabel: string | null;
  onClearCategory: () => void;
  onClearDate: () => void;
  onClearReminder: () => void;
  onClearNote: () => void;
  onSubmit: () => void;
};

export default function PlannerInputBar({
  value,
  onChangeText,
  onOpenCategory,
  onOpenReminder,
  onOpenDate,
  onOpenNote,
  categoryLabel,
  dateLabel,
  reminderLabel,
  noteLabel,
  onClearCategory,
  onClearDate,
  onClearReminder,
  onClearNote,
  onSubmit,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.inputCard}>
        <View style={styles.inputRow}>
          <Ionicons
            name="ellipse-outline"
            size={28}
            color={colors.text.secondary}
          />

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Dodaj zadanie"
            placeholderTextColor={colors.text.secondary}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={onSubmit}
          />
        </View>

        {categoryLabel && (
          <PlannerDateChip
            label={`Marker: ${categoryLabel}`}
            iconName="home-outline"
            tone="category"
            onClear={onClearCategory}
          />
        )}

        {dateLabel && (
          <PlannerDateChip
            label={dateLabel}
            iconName="calendar-outline"
            tone="date"
            onClear={onClearDate}
          />
        )}

        {reminderLabel && (
          <PlannerDateChip
            label={reminderLabel}
            iconName="notifications-outline"
            tone="reminder"
            onClear={onClearReminder}
          />
        )}

        {noteLabel && (
          <PlannerDateChip
            label={noteLabel}
            iconName="document-text-outline"
            tone="note"
            onClear={onClearNote}
          />
        )}

        <View style={styles.iconsRow}>
          <Pressable onPress={onOpenCategory}>
            <Ionicons
              name="home-outline"
              size={24}
              color={colors.text.secondary}
            />
          </Pressable>

          <Pressable onPress={onOpenReminder}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text.secondary}
            />
          </Pressable>

          <Pressable onPress={onOpenDate}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={colors.text.secondary}
            />
          </Pressable>

          <Pressable onPress={onOpenNote}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color={colors.text.secondary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  inputCard: {
    ...cardStyles.card,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(220,225,232,0.8)",
    paddingHorizontal: 14,
    minHeight: 64,
    backgroundColor: colors.background.glass,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: colors.text.primary,
  },
  iconsRow: {
    flexDirection: "row",
    gap: 26,
    marginTop: 18,
    paddingHorizontal: 8,
    alignItems: "center",
  },
});
