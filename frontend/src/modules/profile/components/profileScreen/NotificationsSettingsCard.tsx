import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
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
  const [tempTime, setTempTime] = useState<Date | null>(null);

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
     trackColor={{ true: "rgba(173,219,183,0.8)", false: "rgba(200,200,200,0.5)" }}
            thumbColor={settings.allEnabled && !isMutedTemporarily ? "#fff" : "#f4f3f4"}
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
    trackColor={{ true: "rgba(173,219,183,0.8)", false: "rgba(200,200,200,0.5)" }}
         thumbColor={settings.diaryEnabled ? "#fff" : "#f4f3f4"}
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
          onPress={() => {
 const initialDate = new Date();
      initialDate.setHours(settings.diaryHour, settings.diaryMinute, 0, 0);
            setTempTime(initialDate);
            setShowTimePicker(true);
          }}
           style={styles.smallButton}
     >
         <Text style={styles.smallButtonText}>
    {String(tempTime ? tempTime.getHours() : settings.diaryHour).padStart(2, "0")}:
      {String(tempTime ? tempTime.getMinutes() : settings.diaryMinute).padStart(2, "0")}
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
                       value={tempTime ?? (() => {
                    const d = new Date();
                           d.setHours(settings.diaryHour, settings.diaryMinute, 0, 0);
                 return d;
                   })()}
                is24Hour
                  display={Platform.OS === "ios" ? "spinner" : "default"}
             textColor="#2d3748"
                  themeVariant="light"
           onChange={(event: DateTimePickerEvent, date?: Date) => {
                  if (Platform.OS === "android") {
             setShowTimePicker(false);
                    if (event.type === "set" && date) {
            update({
                    diaryHour: date.getHours(),
                  diaryMinute: date.getMinutes(),
                       });
                  }
          setTempTime(null);
              } else {
               // iOS - update temp value, don't close yet
                  if (date) {
                  setTempTime(date);
                      }
            }
                  }}
                     />
                )}
      {showTimePicker && Platform.OS === "ios" && (
              <View style={styles.iosPickerButtons}>
            <Pressable
        onPress={() => {
              setShowTimePicker(false);
       setTempTime(null);
             }}
           style={styles.iosPickerButton}
          >
          <Text style={styles.iosPickerButtonText}>Anuluj</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setShowTimePicker(false);
         if (tempTime) {
                update({
       diaryHour: tempTime.getHours(),
            diaryMinute: tempTime.getMinutes(),
        });
         }
                    setTempTime(null);
                  }}
                  style={[styles.iosPickerButton, styles.iosPickerButtonConfirm]}
                >
          <Text style={[styles.iosPickerButtonText, styles.iosPickerButtonTextConfirm]}>Zatwierdź</Text>
                </Pressable>
              </View>
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
    backgroundColor: "rgba(111,174,122,0.25)",
  },
  smallButtonText: {
fontSize: 13,
    fontWeight: "700",
    color: "#3d5a45",
  },
  iosPickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  iosPickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(200,200,200,0.3)",
  },
  iosPickerButtonConfirm: {
    backgroundColor: "rgba(111,174,122,0.4)",
  },
  iosPickerButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4a5568",
  },
  iosPickerButtonTextConfirm: {
    color: "#276749",
    fontWeight: "700",
  },
});
