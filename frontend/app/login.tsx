import { useLoginMutation, useRegisterMutation } from "@/hooks/useAuthMutations";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authApi } from "@/services/api/auth";
import { useAuthStore } from "@/services/store/useAuthStore";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGooglePending, setIsGooglePending] = useState(false);

  const router = useRouter();

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const loginSilent = useAuthStore((state) => state.loginSilent);

  const discovery = AuthSession.useAutoDiscovery("https://accounts.google.com");
  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId:
        "592043560416-esld4fb60clp4n510sf14182okkr5ufd.apps.googleusercontent.com",
      redirectUri:
        "com.googleusercontent.apps.592043560416-esld4fb60clp4n510sf14182okkr5ufd:/oauthredirect",
      responseType: AuthSession.ResponseType.Code,
      scopes: ["openid", "profile", "email"],
      usePKCE: true,
    },
    discovery
  );

  const handleLogin = () => {
    if (!email || !password) return Alert.alert("Błąd", "Wpisz email i hasło");
    loginMutation.mutate({ email, password });
  };

  const handleGoogleLogin = async () => {
    setIsGooglePending(true);
    try {
      const result = await promptAsync();
      if (result.type === "success") {
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            code: result.params.code,
            redirectUri:
              "com.googleusercontent.apps.592043560416-esld4fb60clp4n510sf14182okkr5ufd:/oauthredirect",
            clientId:
              "592043560416-esld4fb60clp4n510sf14182okkr5ufd.apps.googleusercontent.com",
            extraParams: request?.codeVerifier
              ? { code_verifier: request.codeVerifier }
              : undefined,
          },
          { tokenEndpoint: "https://oauth2.googleapis.com/token" }
        );
        const idToken = tokenResult.idToken;
        if (!idToken) {
          Alert.alert("Błąd", "Nie udało się pobrać tokenu Google.");
          return;
        }
        const data = await authApi.googleLogin(idToken);
        await loginSilent(data.token, data.user);
        router.replace("/");
      }
    } catch (e) {
      console.error("[OAuth] error:", e);
      Alert.alert("Błąd", "Nie udało się zalogować przez Google.");
    } finally {
      setIsGooglePending(false);
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending || isGooglePending;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />

        <ImageBackground
          source={require("../assets/background.jpg")}
          style={styles.background}
          resizeMode="cover"
          fadeDuration={0}
        >
          <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
              style={{ flex: 1, width: "100%" }}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={0}
            >
              <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={require("../assets/images/cloud.png")}
                  style={styles.cloud}
                />

                <View style={styles.center}>
                  <Text style={styles.hey}>Hej!</Text>
                  <Text style={styles.title}>Zaloguj się</Text>
                </View>

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
                    editable={!isPending}
                  />

                  <Text style={styles.label}>Hasło</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(111,122,134,0.55)"
                    secureTextEntry
                    style={styles.input}
                    editable={!isPending}
                  />

                  <Pressable
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={isPending}
                  >
                    {loginMutation.isPending ? (
                      <ActivityIndicator color="#355A7A" />
                    ) : (
                      <Text style={styles.buttonText}>Zaloguj się</Text>
                    )}
                  </Pressable>

                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>lub</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <Pressable
                    style={styles.googleButton}
                    onPress={handleGoogleLogin}
                    disabled={isPending}
                  >
                    {isGooglePending ? (
                      <ActivityIndicator size="small" color="#DB4437" />
                    ) : (
                      <>
                        <Ionicons name="logo-google" size={18} color="#DB4437" />
                        <Text style={styles.googleButtonText}>
                          Kontynuuj z Google
                        </Text>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => router.push("/register")}
                    disabled={isPending}
                  >
                    <Text style={styles.link}>
                      Nie masz konta?{"\n"}Zarejestruj się
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
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
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  cloud: {
    width: 250,
    height: 240,
    resizeMode: "contain",
    marginTop: 40,
  },

  center: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  hey: {
    fontSize: 42,
    fontWeight: "800",
    color: "#6F7A86",
  },
  title: {
    marginTop: 2,
    fontSize: 26,
    fontWeight: "700",
    color: "#7B8794",
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.52)",
    borderRadius: 28,
    padding: 18,
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
    borderColor: "rgba(170,190,210,0.38)",
    color: "rgba(70,80,90,0.95)",
  },

  button: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "#b6cce9",
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
    color: "#355A7A",
  },

  link: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(111,122,134,0.70)",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(111,122,134,0.2)",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: "rgba(111,122,134,0.60)",
  },
  googleButton: {
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(111,122,134,0.15)",
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7B8794",
  },
});
