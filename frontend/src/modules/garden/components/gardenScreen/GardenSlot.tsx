import { memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
  const scale = TREE_SCALES[slot.y] ?? 1;
  const hasTree = slot.treeState !== 0;
  const canPlant = !hasTree && fruitsBalance > 0;
  const canHarvest = slot.treeState === 4;

  const handlePress = useCallback(async () => {
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

      if (canPlant || canHarvest) {
        await onRefresh();
      }
    } catch (error) {
      console.log("GARDEN SLOT ERROR:", error);
    }
  }, [canPlant, canHarvest, slot.id, onRefresh]);

  return (
    <Pressable onPress={handlePress} style={styles.slot}>
      <View style={styles.treeWrapper}>
        {hasTree && <GardenTree stage={slot.treeState} scale={scale} />}
      </View>
    </Pressable>
  );
}

export default memo(GardenSlot);


const styles = StyleSheet.create({
  slot: {
    width: 150,
    height: 180,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  treeWrapper: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
  },
});