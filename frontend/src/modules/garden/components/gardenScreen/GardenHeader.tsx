import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { apiClient } from "@/services/api/client";

type Props = {
  fruitsBalance: number;
  onRefresh: () => void;
};

const FRUIT_IMAGE = require("../../../../../assets/images/fruit.png");

export default function GardenHeader({ fruitsBalance, onRefresh }: Props) {
  const handleDebugAdd = async () => {
    try {
      const res = await apiClient.post("/streak/debug/add-fruits?amount=5");
      await onRefresh();
      Alert.alert("OK", `Dodano 5 jabłek. Saldo: ${res.data.fruitsBalance}`);
    } catch (e: any) {
      Alert.alert("Błąd", e?.response?.data?.message ?? e?.message ?? "Nieznany błąd");
    }
  };

  return (
    <View style={styles.sign}>
      <View style={styles.row}>
        <Image source={FRUIT_IMAGE} style={styles.icon} resizeMode="contain" />
        <Text style={styles.text}>{fruitsBalance}</Text>
        <Pressable onPress={handleDebugAdd} style={styles.debugBtn}>
          <Text style={styles.debugText}>+5 🍎</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sign: {
    position: "absolute",
    top: 55,
    alignSelf: "center",
    width: 300,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    width: 28,
    height: 28,
  },
  text: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff4dc",
    textShadowColor: "#5a3a1c",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  debugBtn: {
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  debugText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff4dc",
  },
});
