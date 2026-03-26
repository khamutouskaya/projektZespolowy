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

import { colors } from "@/shared/theme/colors";
import { typography } from "@/shared/theme/typography";
import { spacing } from "@/shared/theme/spacing";

import LayoutContainer from "@/shared/layout/LayoutContainer";
import Header from "../components/shared/Header";

const sections = [
  {
    title: "Na stres i napięcie",
    data: [
      {
        id: "1",
        title: "Łagodna Joga na Stres - Spokój i Relaks",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774470527/%C5%81agodna_Joga_na_Stres_-_Spok%C3%B3j_i_Relaks_zs3ylx.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774473315/360_F_523807159_5cr3Vv4eHa40HaGmNGZskXgZ8Md4nPbe_qxy7es.jpg",
      },
      {
        id: "2",
        title: "Joga w 10 minut dla całego ciała",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774475382/Poranna_Medytacja_z_Afirmacjami_%EF%B8%8F_patylp.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774477427/Gemini_Generated_Image_s39q3vs39q3vs39q_e43yvs.png",
      },
      {
        id: "3",
        title: "ozluźnij się po ciężkim dniu",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774475741/Joga_na_Zdrowy_Kr%C4%99gos%C5%82up_i_Barki_enkmex.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774469165/concept-of-conscious-living_djasxn.jpg",
      },
      {
        id: "4",
        title: "Uspokój ciało przed snem",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774476118/Joga_na_Kr%C4%99gos%C5%82up_-_Zdrowe_Plecy_bez_B%C3%B3lu_ssxhke.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774467965/6_vtxwqk.jpg",
      },
      {
        id: "5",
        title: "Joga na stres i napięcie",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774473498/Rozci%C4%85gaj%C4%85ca_joga_na_koniec_dnia_20_min_fxu1ev.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774477396/ChatGPT_Image_25_%D0%BC%D0%B0%D1%80._2026_%D0%B3._22_42_05_w57jyz.png",
      },
    ],
  },
  {
    title: "Na energię ",
    data: [
      {
        id: "6",
        title: "Energetyczna Power Joga",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774475382/Poranna_Medytacja_z_Afirmacjami_%EF%B8%8F_patylp.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774531068/dyzajn-bez-nazvy-2023-06-21t151153855_jmpnca.jpg",
      },
      {
        id: "7",
        title: "Szybka joga na poranek",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774470527/%C5%81agodna_Joga_na_Stres_-_Spok%C3%B3j_i_Relaks_zs3ylx.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774531067/iStock-1455669523-1124x660_xthykb.jpg",
      },
      {
        id: "8",
        title: "Joga, która od razu daje efekt",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774476118/Joga_na_Kr%C4%99gos%C5%82up_-_Zdrowe_Plecy_bez_B%C3%B3lu_ssxhke.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774531067/360_F_289706378_ST1xwYE1T31kznsSuLFEFZ4WiQ2EDHEV_zutn6c.jpg",
      },
      {
        id: "9",
        title: "Obudź ciało w 5 minut",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774473498/Rozci%C4%85gaj%C4%85ca_joga_na_koniec_dnia_20_min_fxu1ev.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774531067/ba91178bd8343ca3dcb13084b2f92dae--inner-peace-back-pain_xvmtr1.jpg",
      },
      {
        id: "10",
        title: "Joga dla elastycznego ciała",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774475741/Joga_na_Zdrowy_Kr%C4%99gos%C5%82up_i_Barki_enkmex.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774531069/Gemini_Generated_Image_gm6oivgm6oivgm6o_xgm139.png",
      },
    ],
  },
  {
    title: "Na emocje i nastrój",
    data: [
      {
        id: "11",
        title: "Odprężająca Joga Po Pracy",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774476118/Joga_na_Kr%C4%99gos%C5%82up_-_Zdrowe_Plecy_bez_B%C3%B3lu_ssxhke.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774531068/sho-take-ioga_odppxl.jpg",
      },
      {
        id: "12",
        title: "Uspokój ciało przed",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774475382/Poranna_Medytacja_z_Afirmacjami_%EF%B8%8F_patylp.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774531067/istockphoto-674564170-612x612_ekzjct.jpg",
      },
      {
        id: "13",
        title: "Zrelaksuj się",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774475741/Joga_na_Zdrowy_Kr%C4%99gos%C5%82up_i_Barki_enkmex.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774467777/ai-generated-beautiful-nature-mountain-scenery-professionalgraphy-photo_ukhtmv.jpg",
      },
      {
        id: "14",
        title: "Wyłącz głowę i oddychaj",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774470527/%C5%81agodna_Joga_na_Stres_-_Spok%C3%B3j_i_Relaks_zs3ylx.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774465184/ai-generated-8689687_1280_isexeh.jpg",
      },
      {
        id: "15",
        title: "15 minut jogi = lekkość w ciele",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774473498/Rozci%C4%85gaj%C4%85ca_joga_na_koniec_dnia_20_min_fxu1ev.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774449941/360_F_597640752_zRM6XcUtquOp3TXiCbln7zx2qbjsWDRx_dqztuo.jpg",
      },
    ],
  },
  {
    title: "Rozluznienie ciała",
    data: [
      {
        id: "17",
        title: "Joga na koniec dnia ",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774473498/Rozci%C4%85gaj%C4%85ca_joga_na_koniec_dnia_20_min_fxu1ev.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774464472/0e34170b9a01873d26d78a98297c6544_bhmmaz.jpg",
      },
      {
        id: "18",
        title: "Spokojna joga na wieczór ",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774470527/%C5%81agodna_Joga_na_Stres_-_Spok%C3%B3j_i_Relaks_zs3ylx.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774477390/ChatGPT_Image_25_%D0%BC%D0%B0%D1%80._2026_%D0%B3._22_43_08_ir8q4f.png",
      },
      {
        id: "19",
        title: "Powolna joga dla relaksu",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774476118/Joga_na_Kr%C4%99gos%C5%82up_-_Zdrowe_Plecy_bez_B%C3%B3lu_ssxhke.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774531067/t1024x619_uvmue2.jpg",
      },
      {
        id: "16",
        title: "Wyłącz głowę i oddychaj",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774476118/Joga_na_Kr%C4%99gos%C5%82up_-_Zdrowe_Plecy_bez_B%C3%B3lu_ssxhke.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774531067/t1024x619_uvmue2.jpg",
      },
      {
        id: "20",
        title: "Uspokój ciało i umysł ",
        videoUrl:
          "https://res.cloudinary.com/dxsukcxzj/video/upload/v1774476118/Joga_na_Kr%C4%99gos%C5%82up_-_Zdrowe_Plecy_bez_B%C3%B3lu_ssxhke.mp4",
        thumbnail:
          "https://res.cloudinary.com/dxsukcxzj/image/upload/v1774469315/image-145_aqrmow.jpg",
      },
    ],
  },
];

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
