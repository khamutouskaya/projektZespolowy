import { View, StyleSheet, FlatList, Text } from "react-native";

import { useState, useRef, useEffect } from "react";
import { setAudioModeAsync } from "expo-audio";
import { useVideoPlayer, VideoView } from "expo-video";
import { sections } from "@/modules/mentalSupport/data/meditation";

import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import Header from "../components/shared/Header";
import MeditationCard from "../components/MeditationCard";

export default function MeditationScreen() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null); //Ten stan steruje: czy pokazać player/jakie wideo odtwarzać

  const player = useVideoPlayer(selectedVideo ?? "");
  const flatListRef = useRef<any>(null);

  //[] → wykona się tylko raz po załadowaniu ekranu, ustawia tryb audio
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
        data={sections}
        keyExtractor={(item) => item.title} //każda sekcja musi mieć unikalny tytuł
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Header
              title="Medytacje"
              image={require("../../../../assets/images/cloud.png")}
            />

            {/* pokazujemy player tylko wtedy, gdy jest wybrane wideo */}
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
              contentContainerStyle={styles.cardsList}
              renderItem={({ item: video }) => (
                <MeditationCard // ✅ ваш готовый компонент
                  video={video}
                  isActive={selectedVideo === video.videoUrl}
                  onPress={() => {
                    setSelectedVideo(video.videoUrl);
                    flatListRef.current?.scrollToOffset({
                      offset: 0,
                      animated: true,
                    });
                  }}
                />
              )}
            />
          </View>
        )}
      />
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 80, // żeby ostatnia sekcja nie była przyklejona do dołu
    paddingTop: 10,
  },

  header: {
    marginTop: -10,
    paddingHorizontal: 20,
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
});
