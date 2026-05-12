import { memo, useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { GardenTreeStage } from "../../garden.types";

type Props = {
  stage: GardenTreeStage;
  scale?: number;
};

const TREE_IMAGES = {
  1: require("../../../../../assets/garden/tree-stage-0.png"),
  2: require("../../../../../assets/garden/tree-stage-1.png"),
  3: require("../../../../../assets/garden/tree-stage-2.png"),
  4: require("../../../../../assets/garden/tree-stage-3.png"),
} as const;

function GardenTree({ stage, scale = 1 }: Props) {
  const imageSource = useMemo(() => {
    return TREE_IMAGES[stage as keyof typeof TREE_IMAGES] ?? TREE_IMAGES[1];
  }, [stage]);

  const imageStyle = useMemo(() => [
    styles.image,
    {
      width: 190 * scale,
      height: 190 * scale,
    },
  ], [scale]);

  return (
    <View style={styles.wrapper}>
      <Image
        source={imageSource}
        style={imageStyle}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
}

export default memo(GardenTree);


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