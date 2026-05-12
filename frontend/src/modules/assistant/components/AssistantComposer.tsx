import { Ionicons } from "@expo/vector-icons";
import { memo, useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
Alert,
  Animated,
} from "react-native";
import { useAudioRecorder, AudioModule, RecordingPresets, AudioSource } from "expo-audio";
import { colors } from "@/shared/theme/colors";

type Props = {
  bottomOffset: Animated.Value | number;
  isLoading: boolean;
  onSendPress: (text: string) => void;
  onVoiceRecordingComplete?: (uri: string) => void;
};

export const AssistantComposer = memo(function AssistantComposer({
  bottomOffset,
  isLoading,
  onSendPress,
  onVoiceRecordingComplete,
}: Props) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isSendDisabled = !text.trim() || isLoading;

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (isRecording) {
      animation = Animated.loop(
  Animated.sequence([
 Animated.timing(pulseAnim, {
            toValue: 1.2,
          duration: 500,
     useNativeDriver: true,
}),
      Animated.timing(pulseAnim, {
  toValue: 1,
 duration: 500,
            useNativeDriver: true,
   }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => animation?.stop();
  }, [isRecording, pulseAnim]);

  const requestPermission = useCallback(async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync();
    setPermissionGranted(status.granted);
    return status.granted;
  }, []);

  const handleVoicePress = useCallback(async () => {
    if (isLoading) return;

    if (permissionGranted === null) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
     "Brak uprawnień",
          "Aby nagrywać wiadomości głosowe, musisz przyznać uprawnienia do mikrofonu w ustawieniach aplikacji."
        );
        return;
      }
    } else if (!permissionGranted) {
      Alert.alert(
        "Brak uprawnień",
        "Aby nagrywać wiadomości głosowe, musisz przyznać uprawnienia do mikrofonu w ustawieniach aplikacji."
      );
      return;
    }

    if (isRecording) {
      try {
        await audioRecorder.stop();
        setIsRecording(false);

        // Poczekaj chwilę na zapisanie pliku
        await new Promise(resolve => setTimeout(resolve, 300));

        const recordingUri = audioRecorder.uri;

        if (recordingUri && onVoiceRecordingComplete) {
          onVoiceRecordingComplete(recordingUri);
        } else {
          Alert.alert("Błąd", "Nie udało się zapisać nagrania. Spróbuj ponownie.");
        }
      } catch (error) {
        console.error("Błąd podczas zatrzymywania nagrywania:", error);
        setIsRecording(false);
        Alert.alert("Błąd", "Nie udało się przetworzyć nagrania. Spróbuj ponownie.");
      }
    } else {
      try {
        await AudioModule.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setIsRecording(true);
      } catch (error) {
        console.error("Błąd podczas rozpoczynania nagrywania:", error);
        Alert.alert("Błąd", "Nie udało się rozpocząć nagrywania. Sprawdź uprawnienia mikrofonu.");
      }
    }
  }, [
    isLoading,
    isRecording,
    permissionGranted,
    requestPermission,
    audioRecorder,
    onVoiceRecordingComplete,
  ]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setText("");
    onSendPress(trimmed);
  };

  return (
    <Animated.View style={[styles.inputRow, { marginBottom: bottomOffset }]}>
      <TextInput
 style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={isRecording ? "Nagrywanie..." : "Napisz wiadomość..."}
        placeholderTextColor={isRecording ? "#C62828" : "rgba(49,66,77,0.45)"}
        multiline
        textAlignVertical="top"
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={handleSend}
        editable={!isRecording}
      />

      <View style={styles.actions}>
   <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
      style={[
   styles.iconButton,
              isRecording && styles.recordingButton,
      ]}
        onPress={handleVoicePress}
      disabled={isLoading}
            accessibilityRole="button"
      accessibilityLabel={isRecording ? "Zatrzymaj nagrywanie" : "Rozpocznij nagrywanie głosowe"}
          >
            <Ionicons
      name={isRecording ? "stop" : "mic-outline"}
  size={22}
    color={isRecording ? "#FFFFFF" : "#567C8D"}
        />
          </TouchableOpacity>
 </Animated.View>

 <TouchableOpacity
          style={[
     styles.iconButton,
       styles.sendButton,
            (isSendDisabled || isRecording) && styles.sendButtonDisabled,
    ]}
    onPress={handleSend}
      disabled={isSendDisabled || isRecording}
          accessibilityRole="button"
          accessibilityLabel="Wyślij wiadomość"
        >
          <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  inputRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 10,
    paddingRight: 16,
    borderRadius: 24,
    backgroundColor: colors.background.glass,
    borderWidth: 0.5,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#22323C",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  recordingButton: {
    backgroundColor: "#C62828",
  },
  sendButton: {
    backgroundColor: colors.text.primary,
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(86,124,141,0.65)",
  },
});
