import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { setAudioModeAsync } from "expo-audio";
import { useVideoPlayer } from "expo-video";
import { useLocalSearchParams } from "expo-router";

import LayoutContainer from "@/shared/layout/LayoutContainer";

import VideoCard from "../components/VideoCard";
import Header from "../components/shared/Header";

import { videos } from "@/modules/mentalSupport/data/breathing";

export default function BreathingScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { videoId } = useLocalSearchParams<{ videoId?: string }>();
  const flatListRef = useRef<FlatList<any>>(null);

  const selectedItem = videos.find((video) => video.id === selectedId);
  const player = useVideoPlayer("");

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

    const timeout = setTimeout(() => {
      scrollToVideo(videoId, false);
    }, 50);

    return () => clearTimeout(timeout);
  }, [videoId]);

  useEffect(() => {
    if (!selectedItem) return;

    player.replace(selectedItem.videoUrl);
    player.play();
  }, [player, selectedItem]);

  useEffect(() => {
    const setup = async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
      });
    };

    setup();
  }, []);

  return (
    <LayoutContainer>
      <FlatList
        ref={flatListRef}
        data={videos}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
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
              title={`Praktyki \nOddechowe`}
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
                if (isActive) {
                  player.play();
                } else {
                  setSelectedId(item.id);
                }
              }}
            />
          );
        }}
      />
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 90,
  },

  header: {
    marginBottom: 15,
  },
});
