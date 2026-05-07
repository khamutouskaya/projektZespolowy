import { ImageBackground, StyleSheet, View } from "react-native";
import GardenHeader from "../components/gardenScreen/GardenHeader";
import GardenBoard from "../components/gardenScreen/GardenBoard";

export default function GardenScreen() {
  return (
    <ImageBackground
      source={require("../../../../assets/garden/garden-background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <GardenHeader />
        <GardenBoard />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingTop: 0,
  },
});