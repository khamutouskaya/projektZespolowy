import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";

type Props = {
  video: {
    id: string;
    title: string;
    videoUrl: string;
    thumbnail: string;
  };
  isActive: boolean;
  onPress: () => void;
};

export default function MeditationCard({ video, isActive, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const touchScale = useRef(new Animated.Value(1)).current;

  const handleTouchStart = () => {
    if (isActive) return;
    Animated.timing(touchScale, {
      toValue: 1.06,
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
          <Image
            source={{ uri: video.thumbnail }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.overlay} />
        </View>

        <Text numberOfLines={1} style={styles.videoTitle}>
          {video.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    marginRight: 12,
    marginVertical: 8,
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
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  videoTitle: {
    marginTop: 6,
    ...typography.body,
    textAlign: "left",
    paddingLeft: spacing.xs,
    color: colors.text.secondary,
  },
});
