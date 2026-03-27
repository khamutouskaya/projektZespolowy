import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Text,
  Image,
} from "react-native";

import { useState, useRef, useEffect } from "react";
import { setAudioModeAsync } from "expo-audio";
import { useVideoPlayer, VideoView } from "expo-video";
import { sections } from "@/modules/mentalSupport/data/meditation";

import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import Header from "../components/shared/Header";

export default function MeditationScreen() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const player = useVideoPlayer(selectedVideo ?? "");
  const flatListRef = useRef<any>(null);
  useEffect(() => {
    const setup = async () => {
      try {
        await setAudioModeAsync({});
      } catch (e) {
        console.log(e);
      }
    };

    setup();
  }, []);

  return (
    <LayoutContainer>
      <FlatList
        ref={flatListRef}
        data={sections}
        keyExtractor={(item) => item.title}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Header
              title="Treningi"
              image={require("../../../../assets/images/cloud.png")}
            />

            {selectedVideo && (
              <VideoView
                key={selectedVideo}
                player={player}
                style={styles.videoPlayer}
                contentFit="cover"
                allowsFullscreen
              />
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.section}>
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>

            <FlatList
              data={item.data}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(video) => video.id}
              contentContainerStyle={{ paddingLeft: 20 }}
              renderItem={({ item: video }) => (
                <Pressable
                  style={[
                    styles.card,
                    selectedVideo === video.videoUrl && styles.activeCard,
                  ]}
                  onPress={() => {
                    setSelectedVideo(video.videoUrl);
                    flatListRef.current?.scrollToOffset({
                      offset: 0,
                      animated: true,
                    });
                  }}
                >
                  <View style={styles.video}>
                    <Image
                      source={{ uri: video.thumbnail }}
                      style={StyleSheet.absoluteFillObject}
                    />

                    {/* затемнение */}
                    <View style={styles.overlay} />

                    {/* play */}
                    <View style={styles.playOverlay}>
                      <Text style={styles.play}>▶</Text>
                    </View>
                  </View>

                  <Text numberOfLines={1} style={styles.videoTitle}>
                    {video.title}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}
      />
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: -10,
    paddingHorizontal: 20,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    ...typography.title,
    color: colors.text.tertiary,
    paddingLeft: spacing.xs,
    marginBottom: spacing.md,
  },

  card: {
    width: 180,
    marginRight: 12,
  },

  activeCard: {
    transform: [{ scale: 0.95 }],
    borderRadius: 16,
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
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  play: {
    fontSize: 30,
    color: "white",
  },

  videoTitle: {
    marginTop: 6,
    ...typography.body,
    textAlign: "left",
    paddingLeft: spacing.xs,
    color: colors.text.secondary,
  },

  videoPlayer: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
  },

  placeholder: {
    height: 220,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
  },
});
