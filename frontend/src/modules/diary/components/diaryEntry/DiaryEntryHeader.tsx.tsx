import { View, Text, StyleSheet, Pressable, Keyboard } from "react-native";
import { useRouter } from "expo-router";

type Props = {
  onSave: () => void;
};

export default function DiaryEntryHeader({ onSave }: Props) {
  const router = useRouter();
  const handleSave = () => {
    Keyboard.dismiss(); // закрываем клавиатуру
  };

  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Powrót</Text>
      </Pressable>

      <Pressable onPress={handleSave}>
        <Text style={styles.ok}>OK</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  back: {
    fontSize: 16,
    color: "#375a85",
    fontWeight: "500",
  },

  ok: {
    fontSize: 16,
    color: "#375a85",
    fontWeight: "600",
  },
});
