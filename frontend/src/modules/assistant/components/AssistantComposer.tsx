import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "@/shared/theme/colors";
type Props = {
  bottomOffset: number;
  inputText: string;
  isLoading: boolean;
  onChangeText: (value: string) => void;
  onSendPress: () => void;
  onVoicePress: () => void;
};

export function AssistantComposer({
  bottomOffset,
  inputText,
  isLoading,
  onChangeText,
  onSendPress,
  onVoicePress,
}: Props) {
  const isSendDisabled = !inputText.trim() || isLoading;

  return (
    <View style={[styles.inputRow, { marginBottom: bottomOffset }]}>
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={onChangeText}
        placeholder="Napisz wiadomość..."
        placeholderTextColor="rgba(49,66,77,0.45)"
        multiline
        textAlignVertical="top"
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={onSendPress}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onVoicePress}
          accessibilityRole="button"
          accessibilityLabel="Wprowadzanie głosowe"
        >
          <Ionicons name="mic-outline" size={22} color="#567C8D" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.iconButton,
            styles.sendButton,
            isSendDisabled && styles.sendButtonDisabled,
          ]}
          onPress={onSendPress}
          disabled={isSendDisabled}
          accessibilityRole="button"
          accessibilityLabel="Wyślij wiadomość"
        >
          <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  sendButton: {
    backgroundColor: colors.text.primary,
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(86,124,141,0.65)",
  },
});
