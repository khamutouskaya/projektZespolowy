import {
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  Pressable,
} from "react-native";
import { useState } from "react";
import LayoutContainer from "@/shared/layout/LayoutContainer";
import { useRouter, useLocalSearchParams } from "expo-router";
import { InputAccessoryView } from "react-native";

export default function DiaryEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const inputAccessoryViewID = "toolbar";
  const [text, setText] = useState(params.text || "");

  const handleSave = () => {
    Keyboard.dismiss(); // закрываем клавиатуру
  };

  const [textColor, setTextColor] = useState("#000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  return (
    <LayoutContainer>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.back}>← Powrót</Text>
            </Pressable>

            <Pressable onPress={handleSave}>
              <Text style={styles.ok}>OK</Text>
            </Pressable>
          </View>

          <TextInput
            multiline
            autoFocus
            placeholder="Napisz o swoim dniu..."
            // value={text}
            onChangeText={setText}
            style={[
              styles.input,
              {
                color: textColor,
                fontWeight: isBold ? "bold" : "normal",
                fontStyle: isItalic ? "italic" : "normal",
                textDecorationLine: isUnderline ? "underline" : "none",
              },
            ]}
            inputAccessoryViewID={inputAccessoryViewID}
          />

          <InputAccessoryView nativeID={inputAccessoryViewID}>
            <View style={styles.toolbar}>
              <Pressable onPress={() => setIsBold(!isBold)}>
                <Text style={styles.tool}>B</Text>
              </Pressable>

              <Pressable onPress={() => setIsItalic(!isItalic)}>
                <Text style={styles.tool}>I</Text>
              </Pressable>

              <Pressable onPress={() => setIsUnderline(!isUnderline)}>
                <Text style={styles.tool}>U</Text>
              </Pressable>

              <Pressable onPress={() => setTextColor("#000")}>
                <View style={[styles.color, { backgroundColor: "#000" }]} />
              </Pressable>

              <Pressable onPress={() => setTextColor("#e63946")}>
                <View style={[styles.color, { backgroundColor: "#ff0015" }]} />
              </Pressable>

              <Pressable onPress={() => setTextColor("#009dff")}>
                <View style={[styles.color, { backgroundColor: "#009dff" }]} />
              </Pressable>
            </View>
          </InputAccessoryView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },

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

  input: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 400,
    textAlignVertical: "top",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#f2f2f2",
  },

  tool: {
    fontSize: 18,
    fontWeight: "600",
    color: "#375a85",
  },

  color: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
