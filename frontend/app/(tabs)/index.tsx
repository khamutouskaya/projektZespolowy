import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { authApi } from "@/src/api/auth";
import { HelloWave } from "@/src/shared/components/ui/hello-wave";
import ParallaxScrollView from "@/src/shared/components/ui/parallax-scroll-view";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Button, Platform, StyleSheet, TextInput } from "react-native";

export default function HomeScreen() {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("password123");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const token = useAuthStore((state: { token: string | null }) => state.token);

  const handleLogin = async () => {
    setStatus("loading");
    setMessage("");
    try {
      const response = await authApi.login({ email, password });
      setStatus("ok");
      setMessage(JSON.stringify(response, null, 2));
    } catch (error: any) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Błąd połączenia",
      );
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Test logowania */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🔗 Test połączenia z backendem</ThemedText>

        <ThemedText>Email:</ThemedText>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="email"
        />

        <ThemedText>Hasło:</ThemedText>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="hasło"
        />

        <Button title="Zaloguj (test)" onPress={handleLogin} />

        <ThemedText>
          Token w store:{" "}
          <ThemedText type="defaultSemiBold">
            {token ? `${token.substring(0, 30)}...` : "BRAK"}
          </ThemedText>
        </ThemedText>

        <ThemedText>
          Status:{" "}
          <ThemedText type="defaultSemiBold">
            {status === "idle" && "⏳ Oczekuje"}
            {status === "loading" && "🔄 Wysyłanie..."}
            {status === "ok" && "✅ OK"}
            {status === "error" && "❌ Błąd"}
          </ThemedText>
        </ThemedText>

        {message ? <ThemedText>{message}</ThemedText> : null}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title="Action"
              icon="cube"
              onPress={() => alert("Action pressed")}
            />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">
            npm run reset-project
          </ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    color: "#000",
    backgroundColor: "#fff",
  },
});
