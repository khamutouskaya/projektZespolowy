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

import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";
import { cardStyle } from "../shared/cardStyle";

type Video = {
  id: string;
  title: string;
};

const mockVideos: Video[] = [
  { id: "1", title: "Medytacja 5 min" },
  { id: "2", title: "Oddychanie" },
  { id: "3", title: "Relaks" },
  { id: "4", title: "Spokój" },
  { id: "5", title: "Sen" },
];

export default function RecentVideos() {
  const router = useRouter();

  return (
    <FlatList
      data={mockVideos}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        paddingHorizontal: 20,
      }}
      //snapToInterval={212}
      // decelerationRate="fast"
      //snapToAlignment="start"
      renderItem={({ item }) => (
        <Pressable style={styles.card}>
          <View style={styles.fakeVideo}>
            <Text style={styles.play}>▶</Text>
          </View>

          <Text numberOfLines={1} style={styles.text}>
            {item.title}
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    // height: 150,
    //marginRight: 12,
    paddingHorizontal: 5,

    //borderWidth: 1,
  },

  fakeVideo: {
    width: "100%",
    height: 120,
    borderRadius: 16,
    backgroundColor: "#7A9CA5",
    justifyContent: "center",
    alignItems: "center",

    // тень
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  play: {
    fontSize: 24,
    color: "white",
  },

  text: {
    marginTop: 6,
    ...typography.body,

    textAlign: "left",
    paddingLeft: spacing.xs,

    color: colors.text.secondary,
  },
});
