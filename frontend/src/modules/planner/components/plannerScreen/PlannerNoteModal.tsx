import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "@/shared/theme/colors";

type Props = {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
};

export default function PlannerNoteModal({
  visible,
  value,
  onChangeText,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Notatka</Text>

            <Pressable onPress={onClose}>
              <Text style={styles.done}>Gotowe</Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder="Dodaj notatkę"
            placeholderTextColor={colors.text.secondary}
            multiline
            autoFocus
            style={styles.input}
            textAlignVertical="top"
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  sheet: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  header: {
    height: 78,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2F3E4D",
  },

  done: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5B7BE3",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(180,190,205,0.45)",
  },

  input: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 30,
    fontSize: 18,
    lineHeight: 28,
    color: "#4F5D6B",
  },
});