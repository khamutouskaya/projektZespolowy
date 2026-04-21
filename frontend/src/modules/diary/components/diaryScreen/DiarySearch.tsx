import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function DiarySearch({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={colors.text.tertiary} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Szukaj w zapisach..."
        placeholderTextColor={colors.text.tertiary}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.background.glass,
    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  icon: {
    marginRight: 8,
  },

  input: {
    ...typography.input,
    flex: 1,
    color: colors.text.secondary,
    fontSize: 15,
  },
});
