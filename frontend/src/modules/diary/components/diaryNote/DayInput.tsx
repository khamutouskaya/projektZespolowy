import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const MAX_LENGTH = 140;

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function DayInput({ value, onChange }: Props) {
  return (
    <View>
      <Text style={styles.title}>Jak minął Twój dzień</Text>

      <View style={styles.card}>
        <TextInput
          multiline
          value={value}
          onChangeText={onChange}
          maxLength={MAX_LENGTH}
          placeholder="Napisz o swoim dniu..."
          placeholderTextColor="#6b7280"
          style={styles.input}
        />

        <Text style={styles.counter}>
          {value.length}/{MAX_LENGTH}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#375a85",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 18,
    padding: 16,
  },

  input: {
    fontSize: 15,
    color: "#1f2937",
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: "top",
  },

  counter: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "right",
  },
});
