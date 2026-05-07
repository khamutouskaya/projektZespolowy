import { useRef, useEffect } from "react";
import { TextInput, StyleSheet, View } from "react-native";
import { colors } from "@/shared/theme/colors";

type Props = {
  text: string;
  setText: (text: string) => void;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  accessoryID: string;
  isNew?: boolean;
  isEditing?: boolean;
};

export default function DiaryTextEditor({
  text,
  setText,
  textColor,
  accessoryID,
  isEditing = false,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  useEffect(() => {
    if (!isEditing) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isEditing]);

  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
    if (nativeEvent.key === "Tab") {
      const { start, end } = selectionRef.current;
      setText(text.slice(0, start) + "\n" + text.slice(end));
    }
  };

  return (
    <View>
      <TextInput
        ref={inputRef}
        multiline
        scrollEnabled={false}
        value={text}
        onChangeText={setText}
        onSelectionChange={({ nativeEvent }) => {
          selectionRef.current = nativeEvent.selection;
        }}
        onKeyPress={handleKeyPress}
        inputAccessoryViewID={accessoryID}
        editable={isEditing}
        style={[styles.body, { color: textColor || colors.text.primary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 25,
    letterSpacing: -0.1,
    textAlignVertical: "top",
    marginBottom: 100,
    color: colors.text.primary,
  },
});
