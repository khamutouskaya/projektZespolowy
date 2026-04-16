// import { View, Text, FlatList, Image, Pressable } from "react-native";
// import { useEffect, useState } from "react";
// import { useRouter } from "expo-router";

// import {
//   getRecentVideos,
//   Video,
// } from "@/modules/mentalSupport/utils/recentVideos";

// export default function RecentVideos() {
//   const [videos, setVideos] = useState<Video[]>([]);
//   const router = useRouter();

//   useEffect(() => {
//     load();
//   }, []);

//   const load = async () => {
//     const data = await getRecentVideos();
//     setVideos(data);
//   };

//   if (videos.length === 0) return null;

//   return (
//     <View style={{ marginTop: 20 }}>
//       <Text style={{ marginBottom: 10 }}>Ostatnio oglądane</Text>

//       <FlatList
//         data={videos}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <Pressable
//             // onPress={() =>
//             //   router.push({
//             //     pathname: "/video/[id]",
//             //     params: { id: item.id },
//             //   })
//             // }
//             style={{ marginRight: 12 }}
//           >
//             <Image
//               source={{ uri: item.thumbnail }}
//               style={{ width: 120, height: 80, borderRadius: 12 }}
//             />
//             <Text numberOfLines={1} style={{ width: 120 }}>
//               {item.title}
//             </Text>
//           </Pressable>
//         )}
//       />
//     </View>
//   );
// }

// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   Pressable,
//   StyleSheet,
// } from "react-native";
// import { useEffect, useState } from "react";
// import { useRouter } from "expo-router";

// import {
//   getRecentVideos,
//   Video,
// } from "@/modules/mentalSupport/utils/recentVideos";

// export default function RecentVideos() {
//   const [videos, setVideos] = useState<Video[]>([]);
//   const router = useRouter();

//   useEffect(() => {
//     loadVideos();
//   }, []);

//   const loadVideos = async () => {
//     const data = await getRecentVideos();
//     setVideos(data);
//   };

//   if (videos.length === 0) return null;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Niedawno używane:</Text>

//       <FlatList
//         data={videos}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <Pressable
//             onPress={() => router.push(`/video/${item.id}` as any)}
//             style={styles.card}
//           >
//             <Image
//               source={
//                 typeof item.thumbnail === "string"
//                   ? { uri: item.thumbnail }
//                   : item.thumbnail
//               }
//               style={styles.image}
//             />
//           </Pressable>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 20,
//   },

//   title: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 10,
//     color: "#000",
//   },

//   card: {
//     width: 140,
//     height: 90,
//     borderRadius: 16,
//     backgroundColor: "#7A9CA5",
//     marginRight: 12,
//     overflow: "hidden",

//     // тень (iOS + Android)
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },

//   image: {
//     width: "100%",
//     height: "100%",
//   },
// });

import { useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import {
  getRandomRecommendedVideos,
  type RecommendedVideo,
} from "@/modules/mentalSupport/utils/recommendedVideos";

type Props = {
  video: RecommendedVideo;
  isActive: boolean;
  onPress: () => void;
};

function RecommendedVideoCard({ video, isActive, onPress }: Props) {
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

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{video.category}</Text>
          </View>
        </View>

        <Text numberOfLines={1} style={styles.videoTitle}>
          {video.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function RecentVideos() {
  const router = useRouter();
  const videos = useRef(getRandomRecommendedVideos(5)).current;

  if (videos.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={videos}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        return (
          <>
            <RecommendedVideoCard
              video={item}
              isActive={false}
              onPress={() =>
                router.push({
                  pathname: item.route,
                  params: { videoId: item.id },
                } as any)
              }
            />
            <Text style={styles.play}>▶</Text>
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingRight: 15,
    paddingVertical: 8,
  },
  card: {
    width: 180,
    marginRight: 12,
    marginVertical: 8,
    overflow: "visible",
    zIndex: 1,
  },

  activeCard: {
    zIndex: 10,
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

    // тень
    shadowColor: "#000",
  },

  play: {
    fontSize: 1,
    opacity: 0,
    color: "transparent",
  },

  image: {
    ...StyleSheet.absoluteFillObject,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  badge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
  },

  badgeText: {
    ...typography.caption,
    color: colors.text.tertiary,
  },

  videoTitle: {
    marginTop: 6,
    ...typography.body,

    textAlign: "left",
    paddingLeft: spacing.xs,

    color: colors.text.secondary,
  },
});
