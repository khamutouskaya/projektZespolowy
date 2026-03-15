import { TextInput, StyleSheet } from "react-native";

type Props = {
  text: string;
  setText: (text: string) => void;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  accessoryID: string;
};

export default function DiaryTextEditor({
  text,
  setText,
  textColor,
  isBold,
  isItalic,
  isUnderline,
  accessoryID,
}: Props) {
  return (
    <TextInput
      multiline
      //autoFocus
      value={text}
      onChangeText={setText}
      placeholder="Napisz o swoim dniu..."
      inputAccessoryViewID={accessoryID}
      style={[
        styles.input,
        {
          color: textColor,
          fontWeight: isBold ? "bold" : "normal",
          fontStyle: isItalic ? "italic" : "normal",
          textDecorationLine: isUnderline ? "underline" : "none",
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
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

    paddingVertical: 12,
    paddingHorizontal: 20,

    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
});
