import {
  Pressable,
  Text,
  Image,
  View,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";

import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";

type Props = {
  title: string;
  image: ImageSourcePropType;
  onPress: () => void;
};

export default function PracticeCard({ title, image, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={image} style={styles.image} />

      <View style={styles.overlay}>
        <Text style={styles.text}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%", //процент от родителя (grid)
    height: 150,
    borderRadius: 20,
    marginBottom: 15, //расстояние между рядами
    overflow: "hidden",
  },

  image: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  text: {
    ...typography.input,
    fontSize: 14,
    fontWeight: "500",
    color: "white",
    textAlign: "center",

    shadowColor: "rgba(0, 0, 0, 0.8)",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 2,
    shadowOpacity: 0.9,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    paddingVertical: 2, // 👈 было 12 → стало меньше
    paddingHorizontal: 12,

    backgroundColor: "rgba(0,0,0,0.3)",

    justifyContent: "center",
    alignItems: "center",
  },
});
