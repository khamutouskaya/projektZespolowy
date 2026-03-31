import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { setAudioModeAsync } from "expo-audio";
import { useVideoPlayer } from "expo-video";

import LayoutContainer from "@/shared/layout/LayoutContainer";

import VideoCard from "../components/VideoCard";
import Header from "../components/shared/Header";

import { videos } from "@/modules/mentalSupport/data/breathing";

export default function BreathingScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedItem = videos.find((video) => video.id === selectedId);
  const player = useVideoPlayer("");

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
        data={videos}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
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
                if (!isActive) {
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
