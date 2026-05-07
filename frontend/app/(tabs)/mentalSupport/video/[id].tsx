import { View, StyleSheet, Text, Pressable } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import { Linking } from "react-native";
import { useState } from "react";

export default function VideoScreen() {
  const { id } = useLocalSearchParams();
  const [hasError, setHasError] = useState(false);

  const openInYoutube = () => {
    Linking.openURL(`https://www.youtube.com/watch?v=${id}`);
  };

  if (hasError) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.text}>Nie można odtworzyć w aplikacji</Text>

        <Pressable style={styles.button} onPress={openInYoutube}>
          <Text style={styles.buttonText}>Otwórz w YouTube</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: `https://www.youtube.com/embed/${id}` }}
        allowsFullscreenVideo
        onError={() => setHasError(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  fallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  text: {
    marginBottom: 20,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#355A7A",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
