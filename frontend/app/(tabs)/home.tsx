import LayoutContainer from "@/shared/layout/LayoutContainer";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();

  const [showOracle, setShowOracle] = useState(false);
  const [oracleAnswer, setOracleAnswer] = useState<string | null>(null);
  const [isOracleThinking, setIsOracleThinking] = useState(false);

  const cloudThoughts = [
    "Małe kroki też są postępem.",
    "Nie musisz robić wszystkiego naraz.",
    "Dziś też jest dobry dzień, żeby zacząć.",
    "Jesteś bliżej niż myślisz.",
    "Spokój też jest siłą.",
    "Oddychaj. Wszystko po kolei.",
    "Nawet mała refleksja ma znaczenie.",
    "To, że próbujesz, już jest ważne.",
  ];

  const thoughtOfTheDay =
    cloudThoughts[new Date().getDate() % cloudThoughts.length];

  const cloudMessages = [
    "Dziękuję, że jesteś\ndziś ze mną 💙",
    "Cieszę się, że tu jesteś ☁️",
    "Dobrze, że robisz to\ndla siebie ✨",
    "Jeden mały krok też\nma znaczenie 🌱",
  ];

  const cloudMessageOfTheDay =
    cloudMessages[new Date().getDate() % cloudMessages.length];

  const handleOracleOpen = () => {
    setShowOracle(true);
    setOracleAnswer(null);
  };

  const handleOracleAnswer = () => {
    if (isOracleThinking) return;

    setIsOracleThinking(true);
    setOracleAnswer("...");

    setTimeout(() => {
      const answers = ["Tak", "Nie"];
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      setOracleAnswer(randomAnswer);
      setIsOracleThinking(false);
    }, 600);
  };

  const handleOracleClose = () => {
    setShowOracle(false);
    setOracleAnswer(null);
    setIsOracleThinking(false);
  };

  return (
    <>
      <LayoutContainer>
        <View style={styles.safe}>
          {/* Przycisk profilu */}
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push("../profile")}
          >
            <Ionicons
              name="person-outline"
              size={22}
              color="rgba(70,90,110,0.75)"
            />
          </Pressable>

          <Image
            source={require("../../assets/images/cloud.png")}
            style={styles.cloud}
          />
          <View style={styles.header}>
            <Text style={styles.hey}>Hej!</Text>
            <Text style={styles.title}>Jak się dziś czujesz?</Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Twój stan emocjonalny</Text>

            <View style={styles.statusPill}>
              <Text style={styles.statusText}>2 dni z rzędu</Text>
              <View style={styles.dot} />
              <Text style={styles.statusText}>Dobra ciągłość</Text>

              <View style={styles.sproutWrap}>
                <Ionicons name="leaf" size={16} color="#6FAE7A" />
              </View>
            </View>
          </View>

          <View style={styles.tilesRow}>
            <Tile
              icon="sparkles-outline"
              label={"Odpowiedź\nod wszechświata"}
              onPress={handleOracleOpen}
            />
            <Tile
              icon="shirt-outline"
              label="Akcesoria"
              onPress={() => router.push("../accessories")}
            />
            <Tile
              icon="leaf-outline"
              label={"Mój\nogródek"}
              onPress={() => router.push("../garden")}
            />
          </View>

          <View style={styles.bottomBubble}>
            <View style={styles.smallCloud}>
              <Ionicons
                name="cloud-outline"
                size={18}
                color="rgba(70,90,110,0.55)"
              />
            </View>

            <Text style={styles.bottomText}>{cloudMessageOfTheDay}</Text>
          </View>

          <View style={styles.thoughtCard}>
            <View style={styles.thoughtHeader}>
              <Ionicons
                name="sparkles-outline"
                size={16}
                color="rgba(70,90,110,0.6)"
              />
              <Text style={styles.thoughtTitle}>Myśl chmurki</Text>
            </View>

            <Text style={styles.thoughtText}>{thoughtOfTheDay}</Text>
          </View>
        </View>
      </LayoutContainer>

      <Modal
        visible={showOracle}
        transparent
        animationType="fade"
        onRequestClose={handleOracleClose}
      >
        <View style={styles.modalRoot}>
          <BlurView
            intensity={38}
            tint="light"
            style={StyleSheet.absoluteFill}
          />

          <Pressable
            style={styles.overlayBackdrop}
            onPress={handleOracleClose}
          />

          <Pressable style={styles.closeButton} onPress={handleOracleClose}>
            <Ionicons name="close" size={26} color="#6F7A86" />
          </Pressable>

          <View style={styles.oracleStage}>
            <Pressable onPress={handleOracleAnswer}>
              <Image
                source={require("../../assets/images/cloud.png")}
                style={styles.oracleMainCloud}
              />
            </Pressable>

            <View style={styles.oracleBubbleWrap}>
              <Image
                source={require("../../assets/images/oracleBubble.png")}
                style={styles.oracleBubbleImage}
              />

              <View style={styles.oracleBubbleText}>
                {!oracleAnswer ? (
                  <Text style={styles.oracleText}>
                    Zadaj pytanie w głowie{"\n"}i naciśnij chmurkę
                  </Text>
                ) : (
                  <Text style={styles.oracleAnswer}>{oracleAnswer}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function Tile({
  icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && { opacity: 0.9 }]}
    >
      <Ionicons name={icon} size={26} color="rgba(70,90,110,0.65)" />
      <Text style={styles.tileText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 110,
  },

  cloud: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    // marginTop: -6,
  },

  header: {
    marginTop: -28,
    alignItems: "center",
    //paddingHorizontal: 24,
  },

  hey: {
    fontSize: 34,
    fontWeight: "800",
    color: "#6F7A86",
  },

  title: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "700",
    color: "#7B8794",
    textAlign: "center",
  },

  statusCard: {
    width: "92%",
    marginTop: 16,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.52)",
  },

  statusLabel: {
    fontSize: 13,
    color: "rgba(111,122,134,0.78)",
    marginBottom: 10,
    fontWeight: "600",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(173,219,183,0.35)",
  },

  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(70,80,90,0.75)",
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(70,80,90,0.35)",
    marginHorizontal: 10,
  },

  sproutWrap: {
    marginLeft: "auto",
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },

  tilesRow: {
    width: "92%",
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  tile: {
    flex: 1,
    height: 92,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.62)",
    alignItems: "center",
    justifyContent: "center",
  },

  tileText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(70,80,90,0.70)",
  },

  bottomBubble: {
    width: "92%",
    marginTop: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.44)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  smallCloud: {
    width: 34,
    height: 34,
    borderRadius: 999,
    //backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(70,80,90,0.78)",
    flexShrink: 1,
    lineHeight: 22,
  },

  thoughtCard: {
    width: "92%",
    marginTop: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.44)",
  },
  profileButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.62)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 10,
  },

  thoughtHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  thoughtTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(70,80,90,0.68)",
  },

  thoughtText: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(70,80,90,0.78)",
    fontWeight: "600",
  },

  modalRoot: {
    flex: 1,
  },

  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  closeButton: {
    position: "absolute",
    top: 72,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },

  oracleStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  oracleMainCloud: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginTop: 40,
  },

  oracleBubbleWrap: {
    position: "absolute",
    top: 220,
    right: 1,
    width: 190,
    height: 155,
  },

  oracleBubbleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  oracleBubbleText: {
    position: "absolute",
    top: 34,
    left: 40,
    width: 112,
    alignItems: "center",
    justifyContent: "center",
  },

  oracleText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4F5D6B",
    textAlign: "center",
  },

  oracleAnswer: {
    fontSize: 42,
    fontWeight: "800",
    color: "#355A7A",
    textAlign: "center",
  },
});
