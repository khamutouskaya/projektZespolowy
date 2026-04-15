import { View, TextInput, StyleSheet } from "react-native";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function DiarySearch({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Szukaj w zapisach..."
        placeholderTextColor="#999"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},

  input: {
    ...typography.input,
    height: 44,
    paddingHorizontal: 15,
    borderRadius: 14,
    flex: 1,

    shadowColor: colors.shadow.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,

    backgroundColor: colors.background.glass, // 👈 под твой стеклянный стиль
    fontSize: 16,
  },
});
