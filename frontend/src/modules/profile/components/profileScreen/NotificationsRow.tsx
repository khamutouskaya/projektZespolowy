import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useNotificationSettings } from "../../hooks/useNotificationSettings";

export default function NotificationsRow() {
  const { settings, loading, update } = useNotificationSettings();

  return (
    <Pressable
      onPress={() => update({ allEnabled: !settings.allEnabled })}
      style={styles.row}
    >
      <Ionicons
        name="notifications-outline"
        size={18}
        color="rgba(70,90,110,0.6)"
      />
      <Text style={styles.label}>Przypomnienia</Text>
      {loading ? (
        <ActivityIndicator size="small" style={{ marginLeft: "auto" }} />
      ) : (
        <Switch
          value={settings.allEnabled}
          onValueChange={(val) => update({ allEnabled: val })}
          style={{ marginLeft: "auto" }}
          trackColor={{ true: "rgba(173,219,183,0.8)", false: undefined }}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(70,80,90,0.75)",
  },
});
