import { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

export default function ShopAvatar() {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 4200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    ).start();
  }, [progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -8, 0],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 2, 0, -2, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatarGlow}>
        <Animated.View
          style={{
            transform: [{ translateY }, { translateX }],
          }}
        >
          <Image
            source={require("../../../../../assets/cloud.png")}
            style={styles.avatar}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Text style={styles.title}>Akcesoria</Text>
      <Text style={styles.subtitle}>Nadaj chmurce wyjątkowy styl</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 30,//pierwsza 30
    paddingTop: 18,
  },
  avatarGlow: {
    width: 300, //pierwsza 250
    height: 200,//pierwsza 170
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,//pierwsza 12
  },
  avatar: {
    width: 300, //pierwsza wersja 230 
    height: 190, //pierwsza wersja 150
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#465d84",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 17,
    color: "#7c8598",
  },
});