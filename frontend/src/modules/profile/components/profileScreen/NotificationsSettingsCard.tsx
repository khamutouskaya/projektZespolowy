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

const ACCENT = "#355A7A";
const ACCENT_LIGHT = "rgba(53,90,122,0.11)";
const TEXT_PRIMARY = "rgba(25,40,58,1)";
const TEXT_SECONDARY = "rgba(60,80,105,0.75)";
const CARD_BG = "rgba(255,255,255,0.80)";
const DIVIDER = "rgba(150,175,200,0.4)";

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

  const showMuteRow = settings.allEnabled;
  const showDiaryRow = settings.allEnabled && !isMutedTemporarily;
  const showTimeRow = showDiaryRow && settings.diaryEnabled;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Powiadomienia</Text>

      <Row
        icon="notifications-outline"
        label="Wszystkie powiadomienia"
        right={
          <Switch
            value={settings.allEnabled && !isMutedTemporarily}
            onValueChange={(val) => update({ allEnabled: val })}
            trackColor={{ true: "rgba(173,219,183,0.9)", false: undefined }}
            thumbColor={settings.allEnabled ? "#4a9c5d" : undefined}
          />
        }
      />

      {showMuteRow && <View style={styles.rowDivider} />}

      {showMuteRow && (
        <Row
          icon="moon-outline"
          label={mutedUntilLabel ?? "Wycisz tymczasowo"}
          iconColor={isMutedTemporarily ? "#4a9c5d" : ACCENT}
          iconBg={isMutedTemporarily ? "rgba(74,156,93,0.12)" : ACCENT_LIGHT}
          right={
            <Pressable
              onPress={isMutedTemporarily ? unmute : handleMuteTemporary}
              style={[
                styles.actionBtn,
                isMutedTemporarily && styles.actionBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  isMutedTemporarily && styles.actionBtnTextActive,
                ]}
              >
                {isMutedTemporarily ? "Odcisz" : "Wycisz"}
              </Text>
            </Pressable>
          }
        />
      )}

      {showDiaryRow && <View style={styles.rowDivider} />}

      {showDiaryRow && (
        <Row
          icon="book-outline"
          label="Przypomnienie dziennika"
          right={
            <Switch
              value={settings.diaryEnabled}
              onValueChange={(val) => update({ diaryEnabled: val })}
              trackColor={{ true: "rgba(173,219,183,0.9)", false: undefined }}
              thumbColor={settings.diaryEnabled ? "#4a9c5d" : undefined}
            />
          }
        />
      )}

      {showTimeRow && <View style={styles.rowDivider} />}

      {showTimeRow && (
        <Row
          icon="time-outline"
          label="Godzina przypomnienia"
          right={
            <Pressable
              onPress={() => setShowTimePicker(true)}
              style={styles.actionBtn}
            >
              <Text style={styles.actionBtnText}>
                {String(settings.diaryHour).padStart(2, "0")}:
                {String(settings.diaryMinute).padStart(2, "0")}
              </Text>
            </Pressable>
          }
        />
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
  iconColor = ACCENT,
  iconBg = ACCENT_LIGHT,
}: {
  icon: any;
  label: string;
  right: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ marginLeft: "auto" }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    gap: 2,
  },
  cardTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 9,
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    flex: 1,
  },
  rowDivider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginLeft: 44,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: ACCENT_LIGHT,
  },
  actionBtnActive: {
    backgroundColor: "rgba(74,156,93,0.12)",
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: ACCENT,
  },
  actionBtnTextActive: {
    color: "#4a9c5d",
  },
});
