import { useRef, useState, useEffect } from "react";
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
  isBold,
  isItalic,
  isUnderline,
  accessoryID,
  isNew = false,
  isEditing = false,
}: Props) {
  const bodyRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isEditing) return;
    const t = setTimeout(() => bodyRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isEditing]);

  const newlineIndex = text.indexOf("\n");
  const titleText = newlineIndex === -1 ? text : text.slice(0, newlineIndex);
  const bodyText = newlineIndex === -1 ? "" : text.slice(newlineIndex + 1);

  const titleTextRef = useRef(titleText);
  titleTextRef.current = titleText;

  const currentBodyRef = useRef(bodyText);

  const [initialBodyText] = useState(bodyText);

  const handleTitleChange = (value: string) => {
    if (value.includes("\n")) {
      const parts = value.split("\n");
      const extra = parts.slice(1).join("\n");
      const newBody = extra
        ? extra + (currentBodyRef.current ? "\n" + currentBodyRef.current : "")
        : currentBodyRef.current;
      setText(parts[0] + "\n" + newBody);
      bodyRef.current?.focus();
    } else {
      setText(
        value +
          (currentBodyRef.current.length > 0
            ? "\n" + currentBodyRef.current
            : ""),
      );
    }
  };

  const handleBodyChange = (value: string) => {
    currentBodyRef.current = value;
    setText(titleTextRef.current + "\n" + value);
  };

  return (
    <View>
      <TextInput
        value={titleText}
        onChangeText={handleTitleChange}
        inputAccessoryViewID={accessoryID}
        returnKeyType="next"
        onSubmitEditing={() => bodyRef.current?.focus()}
        blurOnSubmit={false}
        autoFocus={isNew}
        editable={isEditing}
        style={[styles.title, { color: textColor || colors.text.primary }]}
      />
      <View />
      <TextInput
        ref={bodyRef}
        multiline
        scrollEnabled={false}
        defaultValue={initialBodyText}
        onChangeText={handleBodyChange}
        inputAccessoryViewID={accessoryID}
        editable={isEditing}
        style={[styles.body, { color: textColor || colors.text.secondary }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "500",
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.text.tertiary,
  },
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
