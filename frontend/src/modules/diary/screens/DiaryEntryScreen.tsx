import {
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
import EditorToolbar from "../components/diaryEntry/EditorToolbar";
import DiaryEntryHeader from "../components/diaryEntry/DiaryEntryHeader.tsx";
import DiaryTextEditor from "../components/diaryEntry/DiaryTextEditor";

export default function DiaryEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleSave = () => {
    Keyboard.dismiss(); // закрываем клавиатуру
  };

  const [text, setText] = useState((params.text as string) || "");
  const [textColor, setTextColor] = useState("#000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const inputAccessoryViewID = "toolbar";

  return (
    <LayoutContainer>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <DiaryEntryHeader onSave={handleSave} />

          {/* TEXT INPUT */}
          <DiaryTextEditor
            text={text}
            setText={setText}
            textColor={textColor}
            isBold={isBold}
            isItalic={isItalic}
            isUnderline={isUnderline}
            accessoryID={inputAccessoryViewID}
          />

          {/* TOOLBAR */}
          <EditorToolbar
            toggleBold={() => setIsBold(!isBold)}
            toggleItalic={() => setIsItalic(!isItalic)}
            toggleUnderline={() => setIsUnderline(!isUnderline)}
            setColor={setTextColor}
          />
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
});
