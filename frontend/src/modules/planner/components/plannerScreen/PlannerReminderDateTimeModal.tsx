import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type Mode = "date" | "time";

type Props = {
  visible: boolean;
  initialValue: string | null;
  initialDateOnly?: Date | null;
  pickDateFirst: boolean;
  onClose: () => void;
  onConfirm: (isoString: string) => void;
};

export default function PlannerReminderDateTimeModal({
  visible,
  initialValue,
  initialDateOnly = null,
  pickDateFirst,
  onClose,
  onConfirm,
}: Props) {
  const buildInitialDate = () => {
    if (initialValue) {
      return new Date(initialValue);
    }

    if (initialDateOnly) {
      const next = new Date(initialDateOnly);
      next.setHours(9, 0, 0, 0);
      return next;
    }

    const now = new Date();
    now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(buildInitialDate());
  const [androidMode, setAndroidMode] = useState<Mode>(pickDateFirst ? "date" : "time");
  const [tempDate, setTempDate] = useState<Date>(buildInitialDate());

  useEffect(() => {
    if (!visible) return;

    const next = buildInitialDate();
    setSelectedDate(next);
    setTempDate(next);
    setAndroidMode(pickDateFirst ? "date" : "time");
  }, [visible, initialValue, initialDateOnly, pickDateFirst]);

  const handleIOSConfirm = () => {
    onConfirm(selectedDate.toISOString());
    onClose();
  };

  const handleAndroidChange = (
    event: DateTimePickerEvent,
    pickedDate?: Date
  ) => {
    if (event.type === "dismissed") {
      onClose();
      return;
    }

    if (!pickedDate) return;

    if (androidMode === "date") {
      const merged = new Date(tempDate);
      merged.setFullYear(
        pickedDate.getFullYear(),
        pickedDate.getMonth(),
        pickedDate.getDate()
      );
      setTempDate(merged);
      setAndroidMode("time");
      return;
    }

    const merged = new Date(tempDate);
    merged.setHours(pickedDate.getHours(), pickedDate.getMinutes(), 0, 0);
    onConfirm(merged.toISOString());
    onClose();
  };

  if (!visible) return null;

  if (Platform.OS === "android") {
    return (
      <DateTimePicker
        value={tempDate}
        mode={androidMode}
        display="default"
        is24Hour
        onChange={handleAndroidChange}
      />
    );
  }

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
            <Pressable onPress={onClose}>
              <Text style={styles.cancel}>Anuluj</Text>
            </Pressable>

            <Text style={styles.title}>
              {pickDateFirst ? "Data i czas" : "Wybierz godzinę"}
            </Text>

            <Pressable onPress={handleIOSConfirm}>
              <Text style={styles.done}>Ustaw</Text>
            </Pressable>
          </View>

          <DateTimePicker
            value={selectedDate}
            mode={pickDateFirst ? "datetime" : "time"}
            display="spinner"
            minuteInterval={1}
            is24Hour
            onChange={(_, date) => {
              if (date) setSelectedDate(date);
            }}
            style={styles.picker}
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  sheet: {
    backgroundColor: "#F7F7F8",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(90,90,90,0.55)",
    marginBottom: 16,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancel: {
    fontSize: 17,
    fontWeight: "600",
    color: "rgba(111,122,134,0.9)",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2F3B48",
  },
  done: {
    fontSize: 17,
    fontWeight: "700",
    color: "#4C6EF5",
  },
  picker: {
    backgroundColor: "#F7F7F8",
  },
});