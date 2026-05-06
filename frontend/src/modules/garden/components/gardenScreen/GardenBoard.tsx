import { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import GardenSlot from "./GardenSlot";
import { GardenSlotType } from "../../garden.types";
import { gardenService } from "../../garden.service";

export default function GardenBoard() {
  const [slots, setSlots] = useState<GardenSlotType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGarden = async () => {
    try {
      const data = await gardenService.getGarden();
      setSlots(data);
    } catch (error) {
      console.log("GARDEN ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGarden();
  }, []);

  const rows = [
    slots.filter((s) => s.y === 0),
    slots.filter((s) => s.y === 1),
    slots.filter((s) => s.y === 2),
  ];

  const getRowStyle = (row: number) => {
    switch (row) {
      case 0:
        return {
          marginLeft: -3,
          marginBottom: 10,
        };
      case 1:
        return {
          marginLeft: -3,
          marginBottom: 10,
        };
      case 2:
        return {
          marginLeft: -3,
          marginBottom: 0,
        };
      default:
        return {};
    }
  };

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
        <View key={rowIndex} style={[styles.row, getRowStyle(rowIndex)]}>
          {rowSlots
            .sort((a, b) => a.x - b.x)
            .map((slot) => (
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