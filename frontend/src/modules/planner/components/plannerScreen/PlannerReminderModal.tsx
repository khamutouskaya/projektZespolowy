import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/theme/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  onLaterToday: () => void;
  onTomorrow: () => void;
  onNextWeek: () => void;
  onPickDateTime: () => void;
  onClearReminder: () => void;
  hasReminder: boolean;
};

export default function PlannerReminderModal({
  visible,
  onClose,
  onLaterToday,
  onTomorrow,
  onNextWeek,
  onPickDateTime,
  onClearReminder,
  hasReminder,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>Przypomnienie</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.done}>Gotowe</Text>
            </Pressable>
          </View>

          <Pressable style={styles.optionRow} onPress={onLaterToday}>
            <View style={styles.left}>
              <Ionicons name="time-outline" size={26} color="#4F5D6B" />
              <Text style={styles.optionText}>Później dzisiaj</Text>
            </View>
          </Pressable>

          <Pressable style={styles.optionRow} onPress={onTomorrow}>
            <View style={styles.left}>
              <Ionicons name="calendar-outline" size={26} color="#4F5D6B" />
              <Text style={styles.optionText}>Jutro</Text>
            </View>
          </Pressable>

          <Pressable style={styles.optionRow} onPress={onNextWeek}>
            <View style={styles.left}>
              <Ionicons
                name="calendar-clear-outline"
                size={26}
                color="#4F5D6B"
              />
              <Text style={styles.optionText}>Następnego tygodnia</Text>
            </View>
          </Pressable>

          <Pressable style={styles.optionRow} onPress={onPickDateTime}>
            <View style={styles.left}>
              <Ionicons
                name="calendar-number-outline"
                size={26}
                color="#4F5D6B"
              />
              <Text style={styles.optionText}>Wybierz datę i czas</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.text.secondary}
            />
          </Pressable>

          {hasReminder && (
            <Pressable style={styles.clearRow} onPress={onClearReminder}>
              <Text style={styles.clearText}>Usuń przypomnienie</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  sheet: {
    backgroundColor: "#F7F7F8",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 36,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(90,90,90,0.55)",
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2F3B48",
  },
  done: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4C6EF5",
  },
  optionRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2F3B48",
  },
  clearRow: {
    marginTop: 12,
    paddingTop: 18,
  },
  clearText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#D94B4B",
  },
});