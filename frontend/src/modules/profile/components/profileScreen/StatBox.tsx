import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  icon: any;
  label: string;
  value: string;
};

export default function StatBox({ icon, label, value }: Props) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={20} color="rgba(70,90,110,0.6)" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "rgba(70,80,90,0.85)",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(70,80,90,0.5)",
    textAlign: "center",
  },
});
