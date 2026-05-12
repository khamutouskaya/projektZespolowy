import { useState, useCallback, useMemo, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import GardenSlot from "./GardenSlot";
import GardenHeader from "./GardenHeader";
import { GardenSlotType } from "../../garden.types";
import { gardenService } from "../../garden.service";

const ROW_STYLES: Record<number, object> = {
  0: { marginLeft: -3, marginBottom: 10 },
  1: { marginLeft: -3, marginBottom: 10 },
  2: { marginLeft: -3, marginBottom: 0 },
};

const POLL_INTERVAL_MS = 30_000;

export default function GardenBoard() {
  const [slots, setSlots] = useState<GardenSlotType[]>([]);
  const [fruitsBalance, setFruitsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialLoaded = useRef(false);

  const loadGarden = useCallback(async () => {
    try {
      const data = await gardenService.getGarden();
      setSlots(data.beds);
      setFruitsBalance(data.fruitsBalance);
    } catch (error) {
      console.log("GARDEN ERROR:", error);
    } finally {
      if (!initialLoaded.current) {
        initialLoaded.current = true;
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // pierwsze wejście — pokaż spinner; kolejne — cicha aktualizacja w tle
      if (!initialLoaded.current) {
        setLoading(true);
      }
      loadGarden();

      const interval = setInterval(loadGarden, POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }, [loadGarden]),
  );

  const rows = useMemo(() => {
    const sortedSlots = [...slots].sort((a, b) => a.x - b.x);
    return [
      sortedSlots.filter((s) => s.y === 0),
      sortedSlots.filter((s) => s.y === 1),
      sortedSlots.filter((s) => s.y === 2),
    ];
  }, [slots]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
        <Text style={styles.loaderText}>Ładowanie ogrodu...</Text>
      </View>
    );
  }

  return (
    <>
      <GardenHeader fruitsBalance={fruitsBalance} onRefresh={loadGarden} />
      <View style={styles.container}>
        {rows.map((rowSlots, rowIndex) => (
          <View key={rowIndex} style={[styles.row, ROW_STYLES[rowIndex] || {}]}>
            {rowSlots.map((slot) => (
              <GardenSlot
                key={slot.id}
                slot={slot}
                fruitsBalance={fruitsBalance}
                onRefresh={loadGarden}
              />
            ))}
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 200,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loader: {
    marginTop: 260,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 8,
    color: "#486748",
    fontWeight: "600",
  },
});
