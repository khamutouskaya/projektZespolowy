import { StyleSheet, View } from "react-native";
import { GardenSlotType } from "../../garden.types";
import GardenTree from "./GardenTree";
import { getTreeStage } from "../../utils/getTreeStage";

type Props = {
  slot: GardenSlotType;
};

const getTreeScale = (row: number) => {
  // легка перспектива (нижче = більше)
  if (row === 0) return 0.9;
  if (row === 1) return 1.0;
  if (row === 2) return 1.0;
  return 1;
};

export default function GardenSlot({ slot }: Props) {
  const stage = slot.tree ? getTreeStage(slot.tree.plantedAt) : null;
  const scale = getTreeScale(slot.y);

  return (
    <View style={styles.slot}>
      <View style={styles.treeWrapper}>
        {stage !== null && <GardenTree stage={stage} scale={scale} />}
      </View>
    </View>
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
    bottom: 20, // 🔥 вирівнює всі дерева по "землі"
    alignItems: "center",
  },
});