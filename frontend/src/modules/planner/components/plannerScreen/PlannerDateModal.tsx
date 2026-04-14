import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onToday: () => void;
  onTomorrow: () => void;
  onNextWeek: () => void;
  onPickDate: () => void;
};

export default function PlannerDateModal({
  visible,
  onClose,
  onToday,
  onTomorrow,
  onNextWeek,
  onPickDate,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Termin</Text>

            <Pressable onPress={onClose}>
              <Text style={styles.done}>Gotowe</Text>
            </Pressable>
          </View>

          <OptionRow
            icon="today-outline"
            label="Dzisiaj"
            sideLabel="dz"
            onPress={onToday}
          />

          <OptionRow
            icon="calendar-clear-outline"
            label="Jutro"
            sideLabel="śr"
            onPress={onTomorrow}
          />

          <OptionRow
            icon="calendar-number-outline"
            label="W przyszłym tygodniu"
            sideLabel="pn"
            onPress={onNextWeek}
          />

          <OptionRow
            icon="calendar-outline"
            label="Wybierz datę"
            onPress={onPickDate}
            withChevron
          />
        </View>
      </View>
    </Modal>
  );
}

function OptionRow({
  icon,
  label,
  sideLabel,
  onPress,
  withChevron = false,
}: {
  icon: any;
  label: string;
  sideLabel?: string;
  onPress: () => void;
  withChevron?: boolean;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <Ionicons name={icon} size={24} color="#4F5D6B" />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>

      {withChevron ? (
        <Ionicons name="chevron-forward" size={24} color="rgba(111,122,134,0.82)" />
      ) : (
        <Text style={styles.sideLabel}>{sideLabel}</Text>
      )}
    </Pressable>
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
    paddingBottom: 30,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 64,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(111,122,134,0.55)",
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    height: 74,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2F3E4D",
  },
  done: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5B7BE3",
  },
  row: {
    minHeight: 68,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rowLabel: {
    fontSize: 17,
    color: "#2F3E4D",
    fontWeight: "500",
  },
  sideLabel: {
    fontSize: 16,
    color: "rgba(111,122,134,0.82)",
  },
});