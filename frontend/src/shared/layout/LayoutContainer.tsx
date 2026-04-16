import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
};

export default function LayoutContainer({ children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require("../../../assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  container: {
    flex: 1,
  },
});
