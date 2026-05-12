import { memo, useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { GardenSlotType } from "../../garden.types";
import GardenTree from "./GardenTree";
import { gardenService } from "../../garden.service";
import { useAuthStore } from "@/services/store/useAuthStore";

type Props = {
  slot: GardenSlotType;
  fruitsBalance: number;
  onRefresh: () => void;
};

const TREE_SCALES: Record<number, number> = {
  0: 0.9,
  1: 1.0,
  2: 1.0,
};

function GardenSlot({ slot, fruitsBalance, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const scale = TREE_SCALES[slot.y] ?? 1;
  const hasTree = slot.treeState !== 0;
  const canPlant = !hasTree && fruitsBalance > 0;
  const canHarvest = slot.treeState === 4;

  const handlePress = useCallback(async () => {
    if (!canPlant && !canHarvest) return;
    setLoading(true);
    try {
      if (canPlant) {
        await gardenService.plantTree();
      } else if (canHarvest) {
        const result = await gardenService.harvestTree(slot.id);
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.setState({
            user: { ...currentUser, coinsBalance: result.coinsBalance },
          });
        }
      }
      await onRefresh();
    } catch (error) {
      console.log("GARDEN SLOT ERROR:", error);
    } finally {
      setLoading(false);
    }
  }, [canPlant, canHarvest, slot.id, onRefresh]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.slot,
        pressed && (canPlant || canHarvest) && { opacity: 0.75 },
      ]}
    >
      {/* Dirt patch — always visible */}
      <View style={[styles.dirt, canPlant && styles.dirtActive, canHarvest && styles.dirtHarvest]} />

      <View style={styles.treeWrapper}>
        {loading ? (
          <ActivityIndicator color="#4a7a3a" size="small" />
        ) : hasTree ? (
          <GardenTree stage={slot.treeState} scale={scale} />
        ) : canPlant ? (
          <Text style={styles.plusIcon}>＋</Text>
        ) : null}
      </View>

      {canHarvest && !loading && (
        <View style={styles.harvestBadge}>
          <Text style={styles.harvestText}>Zbierz!</Text>
        </View>
      )}
    </Pressable>
  );
}

export default memo(GardenSlot);

const styles = StyleSheet.create({
  slot: {
    width: 150,
    height: 180,
    marginHorizontal: 10,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  dirt: {
    position: "absolute",
    bottom: 12,
    width: 110,
    height: 28,
    borderRadius: 55,
    backgroundColor: "rgba(101, 67, 33, 0.35)",
    borderWidth: 1.5,
    borderColor: "rgba(80, 50, 20, 0.25)",
  },
  dirtActive: {
    backgroundColor: "rgba(101, 67, 33, 0.55)",
    borderColor: "rgba(80, 50, 20, 0.5)",
  },
  dirtHarvest: {
    backgroundColor: "rgba(60, 130, 50, 0.4)",
    borderColor: "rgba(40, 110, 30, 0.5)",
  },
  treeWrapper: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 160,
  },
  plusIcon: {
    fontSize: 32,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "300",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 16,
  },
  harvestBadge: {
    position: "absolute",
    top: 18,
    backgroundColor: "rgba(255, 210, 60, 0.92)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(180, 140, 0, 0.5)",
  },
  harvestText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4a3a00",
  },
});
