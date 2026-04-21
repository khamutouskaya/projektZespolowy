import { useRouter } from "expo-router";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

type Props = {
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
};

export default function DiaryEntryHeader({ isEditing, onEdit, onSave }: Props) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          router.back();
        }}
      >
        <Text style={styles.note}>‹ Notatka</Text>
      </Pressable>

      {isEditing ? (
        <Pressable style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveText}>Gotowe</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editText}>Edytuj ✏️</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },

  note: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.text.primary,
  },

  saveButton: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },

  saveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.text.primary,
  },

  editText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
});
