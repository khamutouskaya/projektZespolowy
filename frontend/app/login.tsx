import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  return (
    <>
      {/* Прибирає верхній хедер "login" + білу зону */}
      <Stack.Screen options={{ headerShown: false }} />

      <ImageBackground
        source={require("../assets/background.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe}>
          {/* ХМАРКА */}
          <Image source={require("../assets/cloud.png")} style={styles.cloud} />

          {/* ТЕКСТ ПО ЦЕНТРУ */}
          <View style={styles.center}>
            <Text style={styles.hey}>Hej!</Text>
            <Text style={styles.title}>Zaloguj się</Text>
          </View>

          {/* КАРТКА ЗНИЗУ */}
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="rgba(111,122,134,0.55)"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Hasło</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="rgba(111,122,134,0.55)"
              secureTextEntry
              style={styles.input}
            />

            <Pressable
              style={styles.button}
              onPress={() => router.replace("/(tabs)/home")}
            >
              <Text style={styles.buttonText}>Zaloguj się</Text>
            </Pressable>

            <Pressable>
              <Text style={styles.link}>
                Nie masz konta?{"\n"}Zarejestruj się
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safe: {
    flex: 1,
    alignItems: "center",
  },

  /* ХМАРКА */
  cloud: {
    position: "absolute",
    top: 45, // було 20 — на iPhone з Dynamic Island краще нижче
    width: 340,
    height: 340,
    resizeMode: "contain",
  },

  /* ЦЕНТР */
  center: {
    marginTop: 230, // було 200 — щоб текст не ліз на хмарку
    alignItems: "center",
    paddingHorizontal: 24,
  },
  hey: {
    fontSize: 42,
    fontWeight: "800",
    color: "#6F7A86", // темніший, “брендовий”
  },
  title: {
    marginTop: 2,
    fontSize: 26,
    fontWeight: "700",
    color: "#7B8794",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(111,122,134,0.72)",
    textAlign: "center",
  },

  /* КАРТКА */
  card: {
    position: "absolute",
    bottom: 170, // поднять опустить панель
    width: "92%",
    backgroundColor: "rgba(255,255,255,0.52)", // трішки прозоріше
    borderRadius: 28,
    padding: 18,

    // легка тінь, щоб "скло" читалось
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  label: {
    fontSize: 13,
    color: "rgba(111,122,134,0.78)",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(170,190,210,0.38)", // трішки м’якше
    color: "rgba(70,80,90,0.95)",
  },

  /* КНОПКА */
  button: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#b6cce9", // kolor zaloguj sie
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#355A7A", // кращий контраст
  },

  link: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(111,122,134,0.70)",
  },
});
