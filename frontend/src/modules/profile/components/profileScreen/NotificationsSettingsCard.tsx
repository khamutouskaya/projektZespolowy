import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useNotificationSettings } from "../../hooks/useNotificationSettings";

export default function NotificationsSettingsCard() {
  const { settings, loading, update, isMutedTemporarily, muteUntil, unmute } =
    useNotificationSettings();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleMuteTemporary = () => {
    Alert.alert("Wycisz na jak długo?", undefined, [
      {
        text: "1 godzinę",
        onPress: () => {
          const d = new Date();
          d.setHours(d.getHours() + 1);
          muteUntil(d);
        },
      },
      {
        text: "Do jutra",
        onPress: () => {
          const d = new Date();
          d.setDate(d.getDate() + 1);
          d.setHours(8, 0, 0, 0);
          muteUntil(d);
        },
      },
      {
        text: "Na tydzień",
        onPress: () => {
          const d = new Date();
          d.setDate(d.getDate() + 7);
          muteUntil(d);
        },
      },
      { text: "Anuluj", style: "cancel" },
    ]);
  };

  const mutedUntilLabel = isMutedTemporarily
    ? `Wyciszone do ${new Date(settings.mutedUntil!).toLocaleString("pl-PL", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : null;

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Powiadomienia</Text>

      {/* Wszystkie powiadomienia */}
      <Row
        icon="notifications-outline"
        label="Wszystkie powiadomienia"
        right={
          <Switch
            value={settings.allEnabled && !isMutedTemporarily}
            onValueChange={(val) => update({ allEnabled: val })}
            trackColor={{ true: "rgba(173,219,183,0.8)", false: undefined }}
          />
        }
      />

      {/* Wycisz tymczasowo */}
      {settings.allEnabled && (
        <Row
          icon="moon-outline"
          label={mutedUntilLabel ?? "Wycisz tymczasowo"}
          labelColor={isMutedTemporarily ? "#6FAE7A" : undefined}
          right={
            <Pressable
              onPress={isMutedTemporarily ? unmute : handleMuteTemporary}
              style={styles.smallButton}
            >
              <Text style={styles.smallButtonText}>
                {isMutedTemporarily ? "Odcisz" : "Wycisz"}
              </Text>
            </Pressable>
          }
        />
      )}

      {/* Przypomnienie dziennika */}
      {settings.allEnabled && !isMutedTemporarily && (
        <>
          <Row
            icon="book-outline"
            label="Przypomnienie dziennika"
            right={
              <Switch
                value={settings.diaryEnabled}
                onValueChange={(val) => update({ diaryEnabled: val })}
                trackColor={{ true: "rgba(173,219,183,0.8)", false: undefined }}
              />
            }
          />

          {/* Godzina przypomnienia */}
          {settings.diaryEnabled && (
            <Row
              icon="time-outline"
              label="Godzina przypomnienia"
              right={
                <Pressable
                  onPress={() => setShowTimePicker(true)}
                  style={styles.smallButton}
                >
                  <Text style={styles.smallButtonText}>
                    {String(settings.diaryHour).padStart(2, "0")}:
                    {String(settings.diaryMinute).padStart(2, "0")}
                  </Text>
                </Pressable>
              }
            />
          )}
        </>
      )}

      {showTimePicker && (
        <DateTimePicker
          mode="time"
          value={new Date(0, 0, 0, settings.diaryHour, settings.diaryMinute)}
          is24Hour
          onChange={(_, date) => {
            setShowTimePicker(false);
            if (!date) return;
            update({
              diaryHour: date.getHours(),
              diaryMinute: date.getMinutes(),
            });
          }}
        />
      )}
    </View>
  );
}

function Row({
  icon,
  label,
  right,
  labelColor,
}: {
  icon: any;
  label: string;
  right: React.ReactNode;
  labelColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color="rgba(70,90,110,0.6)" />
      <Text style={[styles.rowLabel, labelColor ? { color: labelColor } : {}]}>
        {label}
      </Text>
      <View style={{ marginLeft: "auto" }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.62)",
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(111,122,134,0.78)",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(70,80,90,0.75)",
    flex: 1,
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(173,219,183,0.35)",
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(70,80,90,0.75)",
  },
});
