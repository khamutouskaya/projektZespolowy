import { View, StyleSheet, FlatList, Text, ActivityIndicator, InteractionManager } from "react-native";
import { useState, useRef, useEffect } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { useLocalSearchParams } from "expo-router";
import { sections } from "@/modules/mentalSupport/data/meditation";

import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import Header from "../components/shared/Header";
import MeditationCard from "../components/MeditationCard";

function MeditationContent() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const { videoId } = useLocalSearchParams<{ videoId?: string }>();
  const player = useVideoPlayer(null);
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    if (typeof videoId !== "string") return;
    const initialVideo = sections
      .flatMap((section) => section.data)
      .find((video) => video.id === videoId);
    if (!initialVideo) return;
    setSelectedVideo(initialVideo.videoUrl);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [videoId]);

  useEffect(() => {
    if (!selectedVideo) return;
    player.replace(selectedVideo);
    player.play();
  }, [player, selectedVideo]);

  return (
    <>
      <View style={styles.headerArea}>
        <Header
          title="Medytacje"
          image={require("../../../../assets/images/cloud.png")}
        />
        {selectedVideo && (
          <VideoView
            player={player}
            style={styles.videoPlayer}
            contentFit="cover"
            allowsFullscreen
            nativeControls
          />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={sections}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.content}
        initialNumToRender={3}
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
              contentContainerStyle={styles.cardsList}
              initialNumToRender={3}
              renderItem={({ item: video }) => (
                <MeditationCard
                  video={video}
                  isActive={selectedVideo === video.videoUrl}
                  onPress={() => {
                    if (selectedVideo === video.videoUrl) {
                      player.play();
                    } else {
                      setSelectedVideo(video.videoUrl);
                    }
                    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                  }}
                />
              )}
            />
          </View>
        )}
      />
    </>
  );
}

export default function MeditationScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, []);

  return (
    <LayoutContainer>
      {ready ? (
        <MeditationContent />
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.text.primary} />
        </View>
      )}
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 80,
    paddingTop: 10,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 10,
  },
  cardsList: {
    paddingLeft: 20,
    paddingRight: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.text.tertiary,
    paddingLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  videoPlayer: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
