import { View, Text, Pressable, StyleSheet } from "react-native";
import { InputAccessoryView } from "react-native";

type Props = {
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  setColor: (color: string) => void;
};

export default function EditorToolbar({
  toggleBold,
  toggleItalic,
  toggleUnderline,
  setColor,
}: Props) {
  const inputAccessoryViewID = "toolbar";

  return (
    <InputAccessoryView nativeID={inputAccessoryViewID}>
      <View style={styles.toolbar}>
        <Pressable onPress={toggleBold}>
          <Text style={styles.tool}>B</Text>
        </Pressable>

        <Pressable onPress={toggleItalic}>
          <Text style={styles.tool}>I</Text>
        </Pressable>

        <Pressable onPress={toggleUnderline}>
          <Text style={styles.tool}>U</Text>
        </Pressable>

        <Pressable onPress={() => setColor("#000")}>
          <View style={[styles.color, { backgroundColor: "#000" }]} />
        </Pressable>

        <Pressable onPress={() => setColor("#e63946")}>
          <View style={[styles.color, { backgroundColor: "#e63946" }]} />
        </Pressable>

        <Pressable onPress={() => setColor("#009dff")}>
          <View style={[styles.color, { backgroundColor: "#009dff" }]} />
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#beb8b8",
  },

  tool: {
    fontSize: 18,
    fontWeight: "600",
    color: "#375a85",
  },

  color: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
});
