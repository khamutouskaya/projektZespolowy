import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  InteractionManager,
  StyleSheet,
  View,
} from "react-native";
import { useVideoPlayer } from "expo-video";
import { useLocalSearchParams } from "expo-router";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import VideoCard from "../components/VideoCard";
import Header from "../components/shared/Header";
import { videos } from "@/modules/mentalSupport/data/nature";
import { colors } from "@/shared/theme/colors";

function NatureContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { videoId } = useLocalSearchParams<{ videoId?: string }>();
  const flatListRef = useRef<FlatList<any>>(null);

  const selectedItem = videos.find((video) => video.id === selectedId);
  const player = useVideoPlayer(null);

  const scrollToVideo = (targetId: string, animated: boolean) => {
    const index = videos.findIndex((video) => video.id === targetId);
    if (index === -1) return;
    flatListRef.current?.scrollToIndex({
      index,
      animated,
      viewPosition: 0.12,
    });
  };

  useEffect(() => {
    if (typeof videoId !== "string") return;
    if (!videos.some((video) => video.id === videoId)) return;
    setSelectedId(videoId);
    const timeout = setTimeout(() => scrollToVideo(videoId, false), 50);
    return () => clearTimeout(timeout);
  }, [videoId]);

  useEffect(() => {
    if (!selectedItem) return;
    player.replace(selectedItem.videoUrl);
    player.play();
  }, [player, selectedItem]);

  return (
    <FlatList
      ref={flatListRef}
      data={videos}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      initialNumToRender={4}
      onScrollToIndexFailed={({ index, averageItemLength }) => {
        flatListRef.current?.scrollToOffset({
          offset: averageItemLength * index,
          animated: false,
        });
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: false,
            viewPosition: 0.12,
          });
        }, 50);
      }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Header
            title={`Dźwięki \nNatury`}
            image={require("../../../../assets/images/cloud.png")}
          />
        </View>
      }
      renderItem={({ item }) => {
        const isActive = selectedId === item.id;
        return (
          <VideoCard
            item={item}
            isActive={isActive}
            player={player}
            onPress={() => {
              if (!isActive) setSelectedId(item.id);
            }}
          />
        );
      }}
    />
  );
}

export default function NatureSoundsScreen() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => task.cancel();
  }, []);

  return (
    <LayoutContainer>
      {ready ? (
        <NatureContent />
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
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 5,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
