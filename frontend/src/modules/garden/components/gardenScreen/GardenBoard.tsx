import { useEffect, useState, useCallback, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import GardenSlot from "./GardenSlot";
import { GardenSlotType } from "../../garden.types";
import { gardenService } from "../../garden.service";

const ROW_STYLES: Record<number, object> = {
  0: { marginLeft: -3, marginBottom: 10 },
  1: { marginLeft: -3, marginBottom: 10 },
  2: { marginLeft: -3, marginBottom: 0 },
};


export default function GardenBoard() {
  const [slots, setSlots] = useState<GardenSlotType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGarden = useCallback(async () => {
    try {
      const data = await gardenService.getGarden();
      setSlots(data);
    } catch (error) {
      console.log("GARDEN ERROR:", error);
    } finally {
    setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGarden();
  }, [loadGarden]);

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
    <View style={styles.container}>
      {rows.map((rowSlots, rowIndex) => (
        <View key={rowIndex} style={[styles.row, ROW_STYLES[rowIndex] || {}]}>
          {rowSlots.map((slot) => (
            <GardenSlot key={slot.id} slot={slot} onRefresh={loadGarden} />
          ))}
        </View>
      ))}
    </View>
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