import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Text,
  Linking,
} from "react-native";

import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import Header from "../components/shared/Header";
import { ScrollView } from "react-native";

// 🔥 фейковые видео
const videos = [
  {
    id: "1",
    title: "Oddychanie 4-7-8",
    url: "https://www.youtube.com/watch?v=YRPh_GaiL8s",
  },
  {
    id: "2",
    title: "Oddychanie na stres",
    url: "https://www.youtube.com/watch?v=odADwWzHR24",
  },
  {
    id: "3",
    title: "Relaks i spokój",
    url: "https://www.youtube.com/watch?v=inpok4MKVLM",
  },
];

export default function BreathingScreen() {
  const openVideo = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <LayoutContainer>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Header
              title={`Praktyki \n  Oddechowe`}
              image={require("../../../../assets/images/cloud.png")}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card}>
            <View style={styles.video}>
              <Text style={styles.play}>▶</Text>
            </View>

            <Text style={styles.videoTitle}>{item.title}</Text>
          </Pressable>
        )}
      />
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: -20,
    marginBottom: 0,
  },

  card: {
    marginBottom: 16,
    //borderRadius: 16,
    overflow: "hidden",
  },

  video: {
    height: 150,
    backgroundColor: "#7A9CA5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },

  play: {
    fontSize: 40,
    color: "white",
  },

  videoTitle: {
    marginTop: 6,
    ...typography.body,

    textAlign: "left",
    paddingLeft: spacing.xs,

    color: colors.text.secondary,
  },
});
