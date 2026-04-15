import { useRegisterMutation } from "@/hooks/useAuthMutations";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Keyboard,
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

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const registerMutation = useRegisterMutation();

  const handleRegister = () => {
    if (!email || !password) return Alert.alert("Błąd", "Wpisz email i hasło");
    if (password !== confirmPassword)
      return Alert.alert("Błąd", "Hasła nie są identyczne");

    registerMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google", "Tu będzie logowanie/rejestracja Google");
  };

  const handleFacebookLogin = () => {
    Alert.alert("Facebook", "Tu będzie logowanie/rejestracja Facebook");
  };

  const isPending = registerMutation.isPending;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />

        <ImageBackground
          source={require("../assets/background.png")}
          style={styles.background}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.safe}>
            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <Text style={styles.title}>Zarejestruj się</Text>
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
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(111,122,134,0.55)"
                    secureTextEntry={!showPassword}
                    style={styles.inputInner}
                    editable={!isPending}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="rgba(111,122,134,0.6)"
                    />
                  </Pressable>
                </View>

                <Text style={styles.label}>Potwierdź hasło</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(111,122,134,0.55)"
                    secureTextEntry={!showConfirmPassword}
                    style={styles.inputInner}
                    editable={!isPending}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword((v) => !v)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color="rgba(111,122,134,0.6)"
                    />
                  </Pressable>
                </View>

                <Pressable
                  style={styles.button}
                  onPress={handleRegister}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator color="#355A7A" />
                  ) : (
                    <Text style={styles.buttonText}>Utwórz konto</Text>
                  )}
                </Pressable>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>lub połącz za pomocą</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialContainer}>
                  <Pressable
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={handleGoogleLogin}
                    disabled={isPending}
                  >
                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                    <Text style={styles.socialButtonTextDark}>Google</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.socialButton, styles.facebookButton]}
                    onPress={handleFacebookLogin}
                    disabled={isPending}
                  >
                    <Ionicons name="logo-facebook" size={20} color="#fff" />
                    <Text style={styles.socialButtonTextLight}>Facebook</Text>
                  </Pressable>
                </View>

                <Pressable onPress={() => router.back()} disabled={isPending}>
                  <Text style={styles.link}>
                    Masz już konto?{"\n"}Zaloguj się
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </SafeAreaView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },

  safe: { flex: 1 },

  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 45,
  },
  title: {
    fontSize: 35,
    fontWeight: "800",
    color: "#6F7A86",
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(170,190,210,0.38)",
  },
  inputInner: {
    flex: 1,
    color: "rgba(70,80,90,0.95)",
  },
  eyeBtn: {
    padding: 4,
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
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(111,122,134,0.2)",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: "rgba(111,122,134,0.70)",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(111,122,134,0.1)",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  socialButtonTextDark: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7B8794",
  },
  socialButtonTextLight: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
