import { useDiaryEntries } from "@/modules/diary/hooks/useDiaryEntries";
import { useDiaryVoiceRecorder } from "@/modules/diary/hooks/useDiaryVoiceRecorder";
import { diaryTextTransfer } from "@/modules/diary/services/diaryTextTransfer";
import LayoutContainer from "@/shared/layout/LayoutContainer";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  Animated,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import DiaryEntryHeader from "../components/diaryEntry/DiaryEntryHeader.tsx";
import DiaryTextEditor from "../components/diaryEntry/DiaryTextEditor";
import EditorToolbar from "../components/diaryEntry/EditorToolbar";

export default function DiaryEntryScreen() {
  const { addEntry } = useDiaryEntries();
  const params = useLocalSearchParams();
  const entryId = params.id as string | undefined;
  const isNew = !entryId && !params.text;

  const [text, setText] = useState((params.text as string) || "");
  const [textColor, setTextColor] = useState("#000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const inputAccessoryViewID = "toolbar";

  // New notes start in edit mode; existing notes start in read mode
  const [isEditing, setIsEditing] = useState(isNew);

  const { isRecording, isTranscribing, pulseAnim, handleVoicePress } = useDiaryVoiceRecorder(
    (transcribed) => setText(prev => prev ? prev + "\n" + transcribed : transcribed)
  );

  const scrollRef = useRef<ScrollView>(null);
  const textRef = useRef(text);
  useEffect(() => { textRef.current = text; }, [text]);

  // Save on any exit: swipe right or ‹ Notatka button
  useFocusEffect(
    useCallback(() => {
      return () => {
        diaryTextTransfer.set(textRef.current, entryId);
      };
    }, [entryId]),
  );

  // When keyboard hides (swipe-down), leave edit mode
  useEffect(() => {
    const event = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const sub = Keyboard.addListener(event, () => setIsEditing(false));
    return () => sub.remove();
  }, []);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => Keyboard.dismiss();

  return (
    <LayoutContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        {/* Header is OUTSIDE ScrollView — always visible */}
        <View style={styles.headerWrap}>
          <DiaryEntryHeader
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
          />
          <View style={styles.micRow}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable
                style={[styles.micChip, isRecording && styles.micChipActive]}
                onPress={handleVoicePress}
                disabled={isTranscribing}
                accessibilityRole="button"
                accessibilityLabel={isRecording ? "Zatrzymaj nagrywanie" : "Nagraj głosowo"}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic-outline"}
                  size={14}
                  color={isRecording ? "#fff" : "#375a85"}
                />
                <Text style={[styles.micChipText, isRecording && styles.micChipTextActive]}>
                  {isRecording ? "Zatrzymaj nagrywanie" : isTranscribing ? "Przetwarzanie..." : "Nagraj głosowo"}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <DiaryTextEditor
            text={text}
            setText={setText}
            textColor={textColor}
            isBold={isBold}
            isItalic={isItalic}
            isUnderline={isUnderline}
            accessoryID={inputAccessoryViewID}
            isNew={isNew}
            isEditing={isEditing}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <EditorToolbar
            toggleBold={() => setIsBold(!isBold)}
            toggleItalic={() => setIsItalic(!isItalic)}
            toggleUnderline={() => setIsUnderline(!isUnderline)}
            setColor={setTextColor}
          />
        </InputAccessoryView>
      )}
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  micRow: {
    flexDirection: "row",
    paddingTop: 8,
    paddingBottom: 4,
  },
  micChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "hsl(200, 2%, 74%)",
    backgroundColor: "#f0f4fb",
  },
  micChipActive: {
    backgroundColor: "#C62828",
    borderColor: "#C62828",
  },
  micChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#375a85",
  },
  micChipTextActive: {
    color: "#fff",
  },
});
