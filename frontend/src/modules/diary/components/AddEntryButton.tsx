import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onPress?: () => void;
};

export default function AddEntryButton({ onPress }: Props) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.plus}>✍🏻</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    //position: "absolute",
    //right: 20,

    width: 56,
    height: 56,
    borderRadius: 28,

    backgroundColor: "hsl(253, 45%, 90%)",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#736b6b",
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  plus: {
    fontSize: 28,
    color: "white",
    lineHeight: 28,
    fontWeight: "600",
  },
});
