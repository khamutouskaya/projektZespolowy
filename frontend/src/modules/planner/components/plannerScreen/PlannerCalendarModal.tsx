import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/theme/colors";

type Props = {
  visible: boolean;
  selectedDate: string | null;
  onClose: () => void;
  onConfirm: () => void;
  onSelectDate: (date: string) => void;
};

export default function PlannerCalendarModal({
  visible,
  selectedDate,
  onClose,
  onConfirm,
  onSelectDate,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.backButton}>
              <Ionicons name="chevron-back" size={26} color="#2F3E4D" />
            </Pressable>

            <Text style={styles.title}>Wybór daty</Text>

            <Pressable onPress={onConfirm}>
              <Text style={styles.done}>Ustaw</Text>
            </Pressable>
          </View>

          <Calendar
            onDayPress={(day) => onSelectDate(day.dateString)}
            markedDates={
              selectedDate
                ? {
                    [selectedDate]: {
                      selected: true,
                      selectedColor: "#5B7BE3",
                    },
                  }
                : {}
            }
            theme={{
              backgroundColor: "#FFFFFF",
              calendarBackground: "#FFFFFF",
              textSectionTitleColor: "#2F3E4D",
              selectedDayBackgroundColor: "#5B7BE3",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#5B7BE3",
              dayTextColor: "#2F3E4D",
              textDisabledColor: "#C6CBD4",
              monthTextColor: "#2F3E4D",
              arrowColor: "#2F3E4D",
              textDayFontSize: 22,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 16,
              textMonthFontWeight: "700",
            }}
            firstDay={1}
            enableSwipeMonths
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.14)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 26,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.text.secondary,
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    height: 74,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(240,242,246,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2F3E4D",
  },
  done: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5B7BE3",
  },
});