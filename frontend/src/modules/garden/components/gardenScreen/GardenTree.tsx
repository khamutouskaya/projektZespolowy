import { Image, StyleSheet, View } from "react-native";
import { GardenTreeStage } from "../../garden.types";

type Props = {
  stage: GardenTreeStage;
  scale?: number;
};

export default function GardenTree({ stage, scale = 1 }: Props) {
  const getImage = () => {
    switch (stage) {
      case 0:
        return require("../../../../../assets/garden/tree-stage-0.png");
      case 1:
        return require("../../../../../assets/garden/tree-stage-1.png");
      case 2:
        return require("../../../../../assets/garden/tree-stage-2.png");
      case 3:
        return require("../../../../../assets/garden/tree-stage-3.png");
      case 4:
        return require("../../../../../assets/garden/tree-stage-3.png");

      default:
        return require("../../../../../assets/garden/tree-stage-0.png");
    }
  };

  return (
    <View style={styles.wrapper}>

      <Image
        source={getImage()}
        style={[
          styles.image,
          {
            width: 190 * scale,
            height: 190 * scale,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 160,
    height: 170,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  image: {
    marginBottom: -9,
  },
  shadow: {
    position: "absolute",
    bottom: 8,
    borderRadius: 999,
    backgroundColor: "rgba(35, 70, 25, 0.22)",
    transform: [{ scaleX: 1.5 }],
  },
});