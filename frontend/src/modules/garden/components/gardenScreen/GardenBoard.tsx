import { View, StyleSheet } from "react-native";
import GardenSlot from "./GardenSlot";
import { mockGardenSlots } from "../../data/garden.mock";

export default function GardenBoard() {
  // групуємо слоти по рядках (y)
  const rows = [
    mockGardenSlots.filter((s) => s.y === 0),
    mockGardenSlots.filter((s) => s.y === 1),
    mockGardenSlots.filter((s) => s.y === 2),
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
        marginBottom: 10,//42
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

  return (
    <View style={styles.container}>
      {rows.map((rowSlots, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.row, getRowStyle(rowIndex)]}
        >
          {rowSlots.map((slot) => (
            <GardenSlot key={slot.id} slot={slot} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 200, // загальний відступ від таблички
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
});