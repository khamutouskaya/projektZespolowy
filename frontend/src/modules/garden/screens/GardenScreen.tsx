import { memo } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import GardenBoard from "../components/gardenScreen/GardenBoard";

const GARDEN_BACKGROUND = require("../../../../assets/garden/garden-background.jpg");

function GardenScreen() {
  return (
    <ImageBackground
      source={GARDEN_BACKGROUND}
      style={styles.background}
      resizeMode="cover"
      fadeDuration={0}
    >
      <View style={styles.overlay}>
        <GardenBoard />
      </View>
    </ImageBackground>
  );
}

export default memo(GardenScreen);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingTop: 0,
  },
});
