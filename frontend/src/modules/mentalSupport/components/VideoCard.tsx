import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { VideoView } from "expo-video";

import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";
import { typography } from "@/shared/theme/typography";

type Props = {
  item: {
    id: string;
    title: string;
    videoUrl: string;
    thumbnail: string;
  };
  isActive: boolean;
  onPress: () => void;
  player: any;
};

export default function VideoCard({ item, isActive, onPress, player }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const touchScale = useRef(new Animated.Value(1)).current;

  const handleTouchStart = () => {
    if (isActive) return;
    Animated.timing(touchScale, {
      toValue: 1.04,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleTouchEnd = () => {
    Animated.timing(touchScale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.05 : 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isActive, scale]);

  return (
    <Animated.View
      style={[
        styles.card,
        isActive && styles.activeCard,
        {
          transform: [{ scale: Animated.multiply(scale, touchScale) }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handleTouchStart}
        onPressOut={handleTouchEnd}
      >
        <View style={styles.video}>
          {isActive ? (
            <VideoView
              player={player}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              allowsFullscreen
              nativeControls
            />
          ) : (
            <>
              <Image
                source={{ uri: item.thumbnail }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.overlay} />
            </>
          )}
        </View>

        <Text numberOfLines={1} style={styles.videoTitle}>
          {item.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 355,
    marginBottom: 20,
    marginVertical: 8,
    alignSelf: "center",
    overflow: "visible",
    zIndex: 1,
  },

  activeCard: {
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  video: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.075)",
  },

  videoTitle: {
    marginTop: 6,
    ...typography.body,
    textAlign: "left",
    paddingLeft: spacing.xs,
    color: colors.text.secondary,
  },
});
