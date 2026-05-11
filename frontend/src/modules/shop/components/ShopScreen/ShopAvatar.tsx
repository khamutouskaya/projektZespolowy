import { memo, useEffect, useRef, useMemo } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

type Props = {
  previewImage?: any;
};

const DEFAULT_CLOUD = require("../../../../../assets/cloud.png");

function ShopAvatar({ previewImage }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 4200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    );
    animation.start();

    return () => animation.stop();
  }, [progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -8, 0],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, 2, 0, -2, 0],
  });

  const animatedStyle = useMemo(() => ({
    transform: [{ translateY }, { translateX }],
  }), [translateY, translateX]);

  const imageSource = previewImage || DEFAULT_CLOUD;

  return (
    <View style={styles.container}>
      <View style={styles.avatarGlow}>
        <Animated.View style={animatedStyle}>
          <Image
            source={imageSource}
            style={styles.avatar}
            resizeMode="contain"
            fadeDuration={0}
          />
        </Animated.View>
      </View>

      <Text style={styles.title}>Akcesoria</Text>
      <Text style={styles.subtitle}>Nadaj chmurce wyjątkowy styl</Text>
    </View>
  );
}

export default memo(ShopAvatar);


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