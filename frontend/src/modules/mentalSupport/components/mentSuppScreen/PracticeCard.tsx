import { useRef } from "react";
import {
  Animated,
  Pressable,
  Text,
  Image,
  View,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";

import { typography } from "@/shared/theme/typography";

type Props = {
  title: string;
  image: ImageSourcePropType;
  onPress: () => void;
};

export default function PracticeCard({ title, image, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateCard = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
      <Pressable
        style={[styles.card, styles.cardInner]}
        onPress={onPress}
        onPressIn={() => animateCard(1.06)}
        onPressOut={() => animateCard(1)}
      >
        <Image source={image} style={styles.image} />

        <View style={styles.overlay}>
          <Text style={styles.text}>{title}</Text>
        </View>
      </Pressable>
    </Animated.View>
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
  cardWrapper: {
    width: "48%",
    marginBottom: 15,
  },
  cardInner: {
    width: "100%",
    marginBottom: 0,
  },
});
