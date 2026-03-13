<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { apiClient } from "../../src/services/api/client";
import { useAuthStore } from "../../src/services/store/useAuthStore";

export default function Home() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [apiStatus, setApiStatus] = useState<"idle" | "ok" | "error">("idle");

  useEffect(() => {
    let isMounted = true;

    const testConnection = async () => {
      // Tylko w trybie developerskim logujemy szczegóły
      if (__DEV__) {
        console.log(`[DASHBOARD] Sprawdzanie połączenia... Token: ${!!token}`);
      }

      if (!token) {
        if (isMounted) setApiStatus("idle");
        return;
      }

      try {
        await apiClient.get("/api/users/me");

        if (isMounted) setApiStatus("ok");
      } catch (error: any) {
        // Ignorujemy błąd 404 (Not Found) oznacza, że serwer żyje, tylko nie ma tego adresu
        if (error.response?.status === 404) {
          if (isMounted) setApiStatus("ok");
        } else {
          if (isMounted) setApiStatus("error");
          if (__DEV__) console.error("[DASHBOARD] Błąd API:", error.message);
        }
      }
    };

    testConnection();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {/* ХМАРКА */}
        <Image
          source={require("../../assets/cloud.png")}
          style={styles.cloud}
        />

        {/* ЗАГОЛОВОК */}
        <View style={styles.header}>
          <Text style={styles.hey}>Hej{user ? `, ${user.email}` : ""}!</Text>
          <Text style={styles.title}>Jak się dziś czujesz?</Text>
        </View>

        {/* СТАН ЕМОЦІЙНИЙ */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Twój stan emocjonalny</Text>

          <View style={styles.statusPill}>
            <Text style={styles.statusText}>2 dni z rzędu</Text>

            <View style={styles.dot} />

            <Text style={styles.statusText}>Dobra ciągłość</Text>

            <View style={styles.sproutWrap}>
              <Ionicons name="leaf" size={16} color="#6FAE7A" />
            </View>
          </View>
        </View>

        {/* КНОПКИ */}
        <View style={styles.tilesRow}>
          <Tile
            icon="book-outline"
            label="Dziennik"
            onPress={() => router.push("/(tabs)/diary")}
          />
          <Tile
            icon="chatbubbles-outline"
            label="Asystent"
            onPress={() => router.push("/(tabs)/assistant")}
          />
          <Tile
            icon="sunny-outline"
            label="Refleksja\ndnia"
            onPress={() => router.push("/(tabs)/reflection")}
          />
        </View>

        {/* НИЖНІЙ БУЛБАШ */}
        <View style={styles.bottomBubble}>
          <View style={styles.smallCloud}>
            <Ionicons
              name="cloud-outline"
              size={18}
              color="rgba(70,90,110,0.55)"
            />
          </View>
          <Text style={styles.bottomText}>
            Dziękuję, że jesteś{"\n"}dziś ze mną 💙
          </Text>
          {/* Mały wskaźnik połączenia - minimalny wpływ na wygląd */}
          {apiStatus !== "idle" && (
            <View style={styles.statusDot}>
              <Ionicons
                name={apiStatus === "ok" ? "wifi" : "wifi-outline"}
                size={14}
                color={
                  apiStatus === "ok"
                    ? "rgba(111,174,122,0.8)"
                    : "rgba(200,100,100,0.8)"
                }
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Tile({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.9 }]}
    >
      <Ionicons name={icon} size={26} color="rgba(70,90,110,0.65)" />
      <Text style={styles.tileText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safe: { flex: 1, alignItems: "center" },

  cloud: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginTop: 10,
  },

  header: {
    marginTop: -10,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  hey: {
    fontSize: 34,
    fontWeight: "800",
    color: "#6F7A86",
  },
  title: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "700",
    color: "#7B8794",
    textAlign: "center",
  },

  statusCard: {
    width: "92%",
    marginTop: 16,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.52)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  statusLabel: {
    fontSize: 13,
    color: "rgba(111,122,134,0.78)",
    marginBottom: 10,
    fontWeight: "600",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(173, 219, 183, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(140, 200, 155, 0.35)",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(70,80,90,0.75)",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(70,80,90,0.35)",
    marginHorizontal: 10,
  },
  sproutWrap: {
    marginLeft: "auto",
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  tilesRow: {
    width: "92%",
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  tile: {
    flex: 1,
    height: 92,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.62)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  tileText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(70,80,90,0.70)",
    lineHeight: 14,
  },

  bottomBubble: {
    width: "92%",
    marginTop: 14,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.52)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  smallCloud: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(70,80,90,0.65)",
    flex: 1,
  },
  statusDot: {
    marginLeft: "auto",
  },
});
=======
import { ThemedText } from "@/components/themed-text";
export default function HomeScreen() {
  return <ThemedText>Home</ThemedText>;
}
>>>>>>> 34bd785 (Przywrócenie wcześniejszego stanu maina)
