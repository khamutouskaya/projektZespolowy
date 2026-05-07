import { Pressable, StyleSheet, View } from "react-native";
import { GardenSlotType } from "../../garden.types";
import GardenTree from "./GardenTree";
import { gardenService } from "../../garden.service";

type Props = {
  slot: GardenSlotType;
  onRefresh: () => void;
};

const getTreeScale = (row: number) => {
  if (row === 0) return 0.9;
  if (row === 1) return 1.0;
  if (row === 2) return 1.0;
  return 1;
};

export default function GardenSlot({ slot, onRefresh }: Props) {
  const scale = getTreeScale(slot.y);
  const hasTree = slot.treeState !== 0;

  const handlePress = async () => {
    try {
      if (!hasTree) {
        await gardenService.plantTree();
      } else if (slot.treeState === 4) {
        await gardenService.harvestTree(slot.id);
      }

      await onRefresh();
    } catch (error) {
      console.log("GARDEN SLOT ERROR:", error);
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.slot}>
      <View style={styles.treeWrapper}>
        {hasTree && <GardenTree stage={slot.treeState} scale={scale} />}
      </View>
    </Pressable>
  );
}

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