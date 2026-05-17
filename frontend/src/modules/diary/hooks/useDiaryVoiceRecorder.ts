import { useState, useRef, useEffect, useCallback } from "react";
import { Alert, Animated } from "react-native";
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";
import { assistantApi } from "@/services/api/assistant";

export function useDiaryVoiceRecorder(onTranscribed: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (isRecording) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
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
    if (isTranscribing) return;

    if (permissionGranted === null) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Brak uprawnień",
          "Aby nagrywać notatki głosowe, musisz przyznać uprawnienia do mikrofonu w ustawieniach aplikacji."
        );
        return;
      }
    } else if (!permissionGranted) {
      Alert.alert(
        "Brak uprawnień",
        "Aby nagrywać notatki głosowe, musisz przyznać uprawnienia do mikrofonu w ustawieniach aplikacji."
      );
      return;
    }

    if (isRecording) {
      try {
        await audioRecorder.stop();
        setIsRecording(false);

        await new Promise(resolve => setTimeout(resolve, 300));

        const recordingUri = audioRecorder.uri;

        if (recordingUri) {
          setIsTranscribing(true);
          try {
            const transcribed = await assistantApi.transcribeAudio(recordingUri);
            if (transcribed.trim()) {
              onTranscribed(transcribed.trim());
            }
          } catch {
            // Brak mowy lub zbyt krótkie nagranie — nic nie robimy
          } finally {
            setIsTranscribing(false);
          }
        }
      } catch {
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
      } catch {
        Alert.alert("Błąd", "Nie udało się rozpocząć nagrywania. Sprawdź uprawnienia mikrofonu.");
      }
    }
  }, [isRecording, isTranscribing, permissionGranted, requestPermission, audioRecorder, onTranscribed]);

  return { isRecording, isTranscribing, pulseAnim, handleVoicePress };
}
