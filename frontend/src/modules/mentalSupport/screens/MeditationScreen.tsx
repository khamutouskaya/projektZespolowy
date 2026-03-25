import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Text,
  Linking,
  ScrollView,
} from "react-native";

import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import Header from "../components/shared/Header";

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

const sections = [
  {
    title: "Na sen",
    data: [
      {
        id: "YRPh_GaiL8s",
        title: "Oddychanie 4-7-8",
      },
      {
        id: "odADwWzHR24",
        title: "Oddychanie na stres",
      },
      {
        id: "qadadd",
        title: "Oddychanie 4-7-8",
      },
      {
        id: "daadqad",
        title: "Oddychanie na stres",
      },
      {
        id: "addaa",
        title: "Oddychanie 4-7-8",
      },
      {
        id: "2dwdqa424",
        title: "Oddychanie na stres",
      },
    ],
  },
  {
    title: "Na stres",
    data: [
      {
        id: "wdwd",
        title: "Oddychanie na stres",
      },
      {
        id: "242dwsdw42",
        title: "Oddychanie 4-7-8",
      },
      {
        id: "24ssdsd24",
        title: "Oddychanie na stres",
      },
    ],
  },
  {
    title: "Koncentracja",
    data: [
      {
        id: "dsg",
        title: "Oddychanie na stres",
      },
      {
        id: "dfgdsg",
        title: "Oddychanie 4-7-8",
      },
      {
        id: "24b x cf24",
        title: "Oddychanie na stres",
      },
    ],
  },

  {
    title: "Relaks",
    data: [
      {
        id: "42424",
        title: "Oddychanie na stres",
      },
      {
        id: "4535",
        title: "Oddychanie 4-7-8",
      },
      {
        id: "42422e24",
        title: "Oddychanie na stres",
      },
    ],
  },
];

export default function MeditationScreen() {
  const openVideo = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <LayoutContainer>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Header
              title="Medytacje"
              image={require("../../../../assets/images/cloud.png")}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.section}>
            {/* Заголовок с отступом */}
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>

            {/* Карусель БЕЗ отступов */}
            <FlatList
              data={item.data}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(video) => video.id}
              contentContainerStyle={{
                paddingLeft: 20,
              }}
              renderItem={({ item: video }) => (
                <Pressable style={styles.card}>
                  <View style={styles.video} />
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

  play: {
    fontSize: 40,
    color: "white",
  },

  text: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
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

  video: {
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

  videoTitle: {
    marginTop: 6,
    ...typography.body,

    textAlign: "left",
    paddingLeft: spacing.xs,

    color: colors.text.secondary,
  },
});
