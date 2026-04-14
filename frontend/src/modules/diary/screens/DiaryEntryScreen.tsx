import { useDiaryEntries } from "@/modules/diary/hooks/useDiaryEntries";
import LayoutContainer from "@/shared/layout/LayoutContainer";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import DiaryEntryHeader from "../components/diaryEntry/DiaryEntryHeader.tsx";
import DiaryTextEditor from "../components/diaryEntry/DiaryTextEditor";
import EditorToolbar from "../components/diaryEntry/EditorToolbar";

export default function DiaryEntryScreen() {
  const { addEntry } = useDiaryEntries();
  const [preview, setpreview] = useState("");
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleSave = () => {
    Keyboard.dismiss();
    router.replace({
      pathname: "/(tabs)/diary/note",
      params: { text },
    });
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
          {Platform.OS === "ios" && (
            <InputAccessoryView nativeID={inputAccessoryViewID}>
              {/* TOOLBAR */}
              <EditorToolbar
                toggleBold={() => setIsBold(!isBold)}
                toggleItalic={() => setIsItalic(!isItalic)}
                toggleUnderline={() => setIsUnderline(!isUnderline)}
                setColor={setTextColor}
              />
            </InputAccessoryView>
          )}
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
