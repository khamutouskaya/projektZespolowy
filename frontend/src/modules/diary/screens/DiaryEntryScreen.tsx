import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiaryEntryScreen() {
  return (
    <ImageBackground
      source={require("../../../../assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable>
              <Text style={styles.back}>← Wszystkie</Text>
            </Pressable>

            <Text style={styles.date}>25.12.2025</Text>

            <Pressable style={styles.testButton}>
              <Text style={styles.testText}>Zobacz wyniki testu</Text>
            </Pressable>
          </View>

          {/* MAIN TEXT — NO LIMIT */}
          <View style={styles.card}>
            <TextInput
              multiline
              placeholder="Jak minął Twój dzień?"
              placeholderTextColor="#6b7280"
              style={styles.textInput}
              scrollEnabled={false} // 🔥 важно
            />
          </View>

          {/* SUMMARY */}
          <Text style={styles.sectionTitle}>Podsumowanie dnia:</Text>

          <View style={styles.card}>
            <TextInput
              multiline
              placeholder="Krótko podsumuj swój dzień..."
              placeholderTextColor="#6b7280"
              style={styles.textInput}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  back: {
    fontSize: 14,
    color: "#375a85",
    fontWeight: "500",
  },

  date: {
    fontSize: 13,
    color: "#6b7280",
  },

  testButton: {
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  testText: {
    fontSize: 12,
    color: "#375a85",
    fontWeight: "500",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },

  textInput: {
    fontSize: 15,
    color: "#1f2937",
    lineHeight: 22,
    textAlignVertical: "top",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#375a85",
    marginBottom: 8,
  },
});
