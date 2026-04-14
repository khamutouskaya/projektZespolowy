import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
  noteLabel: string | null; //dodalem
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
            color="rgba(111,122,134,0.82)"
          />

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Dodaj zadanie"
            placeholderTextColor="rgba(111,122,134,0.72)"
            style={styles.input}
            autoFocus
            returnKeyType="done"
            blurOnSubmit={false}
            onSubmitEditing={onSubmit}
          />
        </View>

        {categoryLabel && (
          <PlannerDateChip label={`Marker: ${categoryLabel}`} onClear={onClearCategory} />
        )}

        {dateLabel && <PlannerDateChip label={dateLabel} onClear={onClearDate} />}

        {reminderLabel && (
          <PlannerDateChip label={reminderLabel} onClear={onClearReminder} />
        )}
        {noteLabel && <PlannerDateChip label={noteLabel} onClear={onClearNote} />}

        <View style={styles.iconsRow}>
          <Pressable onPress={onOpenCategory}>
            <Ionicons
              name="home-outline"
              size={24}
              color="rgba(111,122,134,0.82)"
            />
          </Pressable>

          <Pressable onPress={onOpenReminder}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="rgba(111,122,134,0.82)"
            />
          </Pressable>

          <Pressable onPress={onOpenDate}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color="rgba(111,122,134,0.82)"
            />
          </Pressable>

          <Pressable onPress={onOpenNote}>
            <Ionicons
              name="document-text-outline"
              size={24}
              color="rgba(111,122,134,0.82)"
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
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(220,225,232,0.95)",
    paddingHorizontal: 14,
    minHeight: 64,
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#4F5D6B",
  },
  iconsRow: {
    flexDirection: "row",
    gap: 26,
    marginTop: 18,
    paddingHorizontal: 8,
    alignItems: "center",
  },
});