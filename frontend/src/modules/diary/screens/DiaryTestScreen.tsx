import LayoutContainer from "@/shared/layout/LayoutContainer";
import { testResultTransfer } from "@/modules/diary/services/testResultTransfer";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Zone = "emotions" | "cognitive" | "behavior" | "resources";

type Question = {
  zone: Zone;
  question: string;
  hint: string;
  options: { label: string; score: number }[];
};

const ZONE_META: Record<
  Zone,
  { label: string; icon: string; color: string; description: string }
> = {
  emotions: {
    label: "Emocje",
    icon: "💛",
    color: "#f7b731",
    description: "Co czułeś/aś dzisiaj",
  },
  cognitive: {
    label: "Myślenie",
    icon: "🧠",
    color: "#7c6be8",
    description: "Jak interpretujesz swój dzień",
  },
  behavior: {
    label: "Zachowanie",
    icon: "🏃",
    color: "#4caf92",
    description: "Co realnie robiłeś/aś",
  },
  resources: {
    label: "Zasoby",
    icon: "🔋",
    color: "#375a85",
    description: "Sen i energia fizyczna",
  },
};

const QUESTIONS: Question[] = [
  // --- EMOCJE ---
  {
    zone: "emotions",
    question: "Jakie emocje dominowały w ciągu dnia?",
    hint: "Wybierz to, co najlepiej opisuje większość dnia",
    options: [
      { label: "😄  Radość, spokój lub wdzięczność", score: 5 },
      { label: "🙂  Głównie neutralne, bez silnych odczuć", score: 4 },
      { label: "😟  Lekki niepokój, smutek lub irytacja", score: 3 },
      { label: "😔  Wyraźny smutek, złość lub strach", score: 2 },
      { label: "😰  Przytłaczające negatywne emocje", score: 1 },
    ],
  },
  {
    zone: "emotions",
    question: "Jak często czułeś/aś się przytłoczony/a emocjonalnie?",
    hint: "Chodzi o momenty, gdy emocje były trudne do opanowania",
    options: [
      { label: "✅  Wcale — byłem/am opanowany/a", score: 5 },
      { label: "🌤️  Raz, krótko i szybko minęło", score: 4 },
      { label: "😐  Kilka razy, ale dawałem/am radę", score: 3 },
      { label: "⚠️  Przez dużą część dnia", score: 2 },
      { label: "🔴  Niemal cały czas — było bardzo ciężko", score: 1 },
    ],
  },

  // --- POZNANIE ---
  {
    zone: "cognitive",
    question: "Jak oceniasz ten dzień z perspektywy wieczoru?",
    hint: "Twoja ogólna ocena, nie pojedynczych momentów",
    options: [
      { label: "🌟  Bardzo udany — mam poczucie satysfakcji", score: 5 },
      { label: "👍  Raczej dobry", score: 4 },
      { label: "😐  Ani dobry, ani zły", score: 3 },
      { label: "😕  Raczej trudny lub rozczarowujący", score: 2 },
      { label: "😞  Jeden z gorszych dni — poczucie porażki", score: 1 },
    ],
  },
  {
    zone: "cognitive",
    question: "Jak radziłeś/aś sobie z natrętnymi myślami lub zmartwieniami?",
    hint: 'Czy myśli o problemach dało się "wyciszyć"?',
    options: [
      { label: "🧘  Łatwo odkładałem/am je na bok", score: 5 },
      { label: "🙂  Myślałem/am o nich, ale bez nadmiernego stresu", score: 4 },
      { label: "😤  Były w tle i trochę rozpraszały", score: 3 },
      {
        label:
          "😰  Zajmowały dużo uwagi, trudno było skupić się na czymś innym",
        score: 2,
      },
      { label: "🌀  Nie mogłem/am przestać — pętla myśli", score: 1 },
    ],
  },

  // --- ZACHOWANIE ---
  {
    zone: "behavior",
    question: "Jak wyglądała Twoja aktywność fizyczna dzisiaj?",
    hint: "Ruch wpływa bezpośrednio na nastrój i poziom stresu",
    options: [
      { label: "🏅  Aktywny/a — trening, sport lub długi spacer", score: 5 },
      {
        label: "🚶  Był ruch — krótki spacer lub codzienne czynności",
        score: 4,
      },
      { label: "💺  Mało — głównie siedziałem/am", score: 3 },
      { label: "🛋️  Prawie żadnego ruchu przez cały dzień", score: 2 },
      { label: "🛏️  Nie wstałem/am z łóżka lub kanapy", score: 1 },
    ],
  },
  {
    zone: "behavior",
    question: "Jak wyglądały Twoje relacje z innymi dzisiaj?",
    hint: "Jakość kontaktów — nie ich ilość",
    options: [
      { label: "🤗  Pozytywne, czułem/am się wspierany/a", score: 5 },
      { label: "😊  Normalne, neutralne interakcje", score: 4 },
      { label: "😶  Minimalne kontakty — nie szukałem/am ich", score: 3 },
      {
        label: "😣  Unikałem/am kontaktów lub czułem/am się niezrozumiany/a",
        score: 2,
      },
      { label: "💔  Byłem/am izolowany/a lub były konflikty", score: 1 },
    ],
  },

  // --- ZASOBY ---
  {
    zone: "resources",
    question: "Ile godzin spałeś/aś ostatniej nocy?",
    hint: "Chodzi o faktyczny sen, nie czas w łóżku",
    options: [
      { label: "😴  7–9 godzin — optymalny sen", score: 5 },
      { label: "🌙  6–7 godzin — całkiem dobrze", score: 4 },
      { label: "⏰  5–6 godzin — trochę za mało", score: 3 },
      { label: "😵  Mniej niż 5 godzin", score: 2 },
      { label: "💀  Prawie nie spałem/am", score: 1 },
    ],
  },
  {
    zone: "resources",
    question: "Jak oceniasz swój poziom energii przez większość dnia?",
    hint: "Fizyczna i mentalna zdolność do działania",
    options: [
      { label: "⚡  Wysoki — miałem/am siłę i chęć do działania", score: 5 },
      { label: "👍  Dobry — dawałem/am radę bez problemu", score: 4 },
      { label: "😐  Przeciętny — ani dobrze, ani źle", score: 3 },
      { label: "😴  Niski — trudno było się zmobilizować", score: 2 },
      { label: "🪫  Bardzo niski — ledwo funkcjonowałem/am", score: 1 },
    ],
  },
];

type ZoneScores = Record<Zone, number>;

function calcZoneScores(answers: number[]): ZoneScores {
  const scores: ZoneScores = {
    emotions: 0,
    cognitive: 0,
    behavior: 0,
    resources: 0,
  };
  QUESTIONS.forEach((q, i) => {
    if (answers[i] !== undefined) scores[q.zone] += answers[i];
  });
  return scores;
}

function zoneLevel(score: number): { label: string; color: string } {
  if (score >= 9) return { label: "Dobra kondycja", color: "#4caf92" };
  if (score >= 6) return { label: "Umiarkowana", color: "#f7b731" };
  return { label: "Wymaga uwagi", color: "#ef5350" };
}

const ZONE_TIPS: Record<Zone, Record<"high" | "mid" | "low", string>> = {
  emotions: {
    high: "Twoje emocje są w równowadze — to ważny fundament zdrowia psychicznego.",
    mid: "Odczuwałeś/aś mieszane emocje. Spróbuj wieczorem zapisać 3 rzeczy, za które jesteś wdzięczny/a.",
    low: "Dzisiaj emocje były trudne. Nie ignoruj tego sygnału — porozmawiaj z kimś zaufanym.",
  },
  cognitive: {
    high: "Patrzysz na dzień realistycznie i konstruktywnie — to oznaka odporności psychicznej.",
    mid: "Masz tendencję do zamartwiania się. Pomocne może być wypisanie problemów na papier.",
    low: "Myśli natrętne lub poczucie porażki mogą wyczerpywać. Rozważ techniki uważności lub rozmowę ze specjalistą.",
  },
  behavior: {
    high: "Byłeś/aś aktywny/a i utrzymywałeś/aś kontakty — to chroni przed stresem.",
    mid: "Mało ruchu lub ograniczone kontakty. Nawet 15 minut spaceru może poprawić nastrój.",
    low: "Izolacja i brak aktywności pogłębiają zmęczenie psychiczne. Małe kroki — wyjdź na chwilę na zewnątrz.",
  },
  resources: {
    high: "Dobry sen i energia to baza, na której buduje się cała reszta. Tak trzymaj!",
    mid: "Twoje zasoby są trochę uszczuplone. Zadbaj o regularny rytm snu.",
    low: "Niedobór snu i niska energia silnie obniżają odporność psychiczną. Priorytetem jest odpoczynek.",
  },
};

function getTip(zone: Zone, score: number): string {
  if (score >= 9) return ZONE_TIPS[zone].high;
  if (score >= 6) return ZONE_TIPS[zone].mid;
  return ZONE_TIPS[zone].low;
}

function overallResult(total: number): {
  title: string;
  description: string;
  color: string;
} {
  if (total >= 32)
    return {
      title: "Dobry stan psychiczny",
      description:
        "Dzisiaj funkcjonujesz na wysokim poziomie we wszystkich czterech obszarach. To naprawdę dobry wynik.",
      color: "#4caf92",
    };
  if (total >= 24)
    return {
      title: "Stabilny stan psychiczny",
      description:
        "Ogólnie dajesz radę, choć w jednym lub dwóch obszarach coś Cię kosztowało. Warto przyjrzeć się tym miejscom.",
      color: "#7c6be8",
    };
  if (total >= 16)
    return {
      title: "Dzień był wymagający",
      description:
        "Kilka obszarów sygnalizuje przeciążenie. To naturalny sygnał, że potrzebujesz odpoczynku i wsparcia.",
      color: "#f7b731",
    };
  return {
    title: "Trudny dzień — zadbaj o siebie",
    description:
      "Twój organizm i psychika dają wyraźne sygnały przemęczenia. Nie bagatelizuj tego — sięgnij po pomoc lub odpoczynek.",
    color: "#ef5350",
  };
}

export default function DiaryTestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ viewResult?: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(() => !!params.viewResult);
  const [directResult] = useState(() =>
    params.viewResult ? testResultTransfer.get() : null,
  );

  const question = QUESTIONS[currentIndex];
  const isLast = currentIndex === QUESTIONS.length - 1;
  const zone = ZONE_META[question?.zone];

  const handleNext = () => {
    if (selectedOption === null) return;
    const score = question.options[selectedOption].score;
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);
    setSelectedOption(null);
    if (isLast) {
      setShowResult(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (showResult) {
    const totalScore = directResult
      ? directResult.totalScore
      : answers.reduce((a, b) => a + b, 0);
    const zoneScores = directResult
      ? directResult.zoneScores
      : calcZoneScores(answers);
    if (!directResult) testResultTransfer.set({ totalScore, zoneScores });
    const overall = overallResult(totalScore);
    const zones = Object.keys(ZONE_META) as Zone[];

    return (
      <LayoutContainer>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>‹ Wróć</Text>
            </Pressable>
          </View>

          <Text style={styles.resultScreenLabel}>Wynik dziennego testu</Text>

          {/* Overall score */}
          <View
            style={[styles.overallCard, { borderLeftColor: overall.color }]}
          >
            <View style={styles.overallTop}>
              <View>
                <Text style={styles.overallTitle}>{overall.title}</Text>
                <Text style={styles.overallScore}>
                  <Text
                    style={[styles.overallScoreBig, { color: overall.color }]}
                  >
                    {totalScore}
                  </Text>
                  <Text style={styles.overallScoreMax}> / 40 pkt</Text>
                </Text>
              </View>
              <View
                style={[
                  styles.overallCircle,
                  {
                    backgroundColor: overall.color + "22",
                    borderColor: overall.color,
                  },
                ]}
              >
                <Text
                  style={[styles.overallCircleText, { color: overall.color }]}
                >
                  {totalScore}
                </Text>
              </View>
            </View>
            <Text style={styles.overallDesc}>{overall.description}</Text>
          </View>

          {/* Zone breakdown */}
          <Text style={styles.zonesHeading}>Wyniki według obszarów</Text>
          {zones.map((zoneKey) => {
            const meta = ZONE_META[zoneKey];
            const score = zoneScores[zoneKey];
            const level = zoneLevel(score);
            const tip = getTip(zoneKey, score);
            const fillPct = (score / 10) * 100;
            return (
              <View key={zoneKey} style={styles.zoneCard}>
                <View style={styles.zoneCardTop}>
                  <View style={styles.zoneCardLeft}>
                    <Text style={styles.zoneCardIcon}>{meta.icon}</Text>
                    <View>
                      <Text style={styles.zoneCardLabel}>{meta.label}</Text>
                      <Text style={styles.zoneCardDesc}>
                        {meta.description}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.zoneBadge,
                      { backgroundColor: level.color + "22" },
                    ]}
                  >
                    <Text
                      style={[styles.zoneBadgeText, { color: level.color }]}
                    >
                      {level.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.zoneBarBg}>
                  <View
                    style={[
                      styles.zoneBarFill,
                      {
                        width: `${fillPct}%` as any,
                        backgroundColor: meta.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.zoneScore}>{score} / 10</Text>

                <Text style={styles.zoneTip}>{tip}</Text>
              </View>
            );
          })}

          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Gotowe</Text>
          </Pressable>
        </ScrollView>
      </LayoutContainer>
    );
  }

  return (
    <LayoutContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Wróć</Text>
          </Pressable>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {QUESTIONS.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width:
                  `${((currentIndex + 1) / QUESTIONS.length) * 100}%` as any,
                backgroundColor: zone.color,
              },
            ]}
          />
        </View>

        {/* Zone badge */}
        <View style={[styles.zonePill, { backgroundColor: zone.color + "22" }]}>
          <Text style={styles.zonePillText}>
            {zone.icon} {zone.label}
          </Text>
        </View>

        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.questionHint}>{question.hint}</Text>

        <View style={styles.optionsList}>
          {question.options.map((option, index) => (
            <Pressable
              key={index}
              style={[
                styles.optionCard,
                selectedOption === index && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedOption(index)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOption === index && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[
            styles.nextBtn,
            selectedOption === null && styles.nextBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedOption === null}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? "Zobacz wynik" : "Dalej →"}
          </Text>
        </Pressable>
      </ScrollView>
    </LayoutContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    marginTop: 8,
  },
  backBtn: { paddingVertical: 6 },
  backText: { fontSize: 17, color: "#375a85", fontWeight: "600" },
  progressText: { fontSize: 14, color: "#888", fontWeight: "500" },
  progressBarContainer: {
    height: 5,
    backgroundColor: "#e8ecf2",
    borderRadius: 3,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  zonePill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  zonePillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3a4a5c",
    letterSpacing: 0.3,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a2d4a",
    marginBottom: 8,
    lineHeight: 30,
  },
  questionHint: {
    fontSize: 14,
    color: "#8a9ab0",
    marginBottom: 24,
    lineHeight: 20,
  },
  optionsList: { gap: 11, marginBottom: 28 },
  optionCard: {
    backgroundColor: "#f5f7fb",
    borderRadius: 13,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCardSelected: {
    backgroundColor: "hsl(226, 60%, 94%)",
    borderColor: "#375a85",
  },
  optionText: {
    fontSize: 15,
    color: "#3a4a5c",
    fontWeight: "500",
    lineHeight: 22,
  },
  optionTextSelected: {
    color: "#375a85",
    fontWeight: "700",
  },
  nextBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#375a85",
  },
  nextBtnDisabled: {
    backgroundColor: "#b0bec5",
  },
  nextBtnText: { fontSize: 17, fontWeight: "700", color: "#fff" },

  // Result screen
  resultScreenLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  overallCard: {
    backgroundColor: "#f8f9fd",
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 5,
    marginBottom: 28,
  },
  overallTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a2d4a",
    marginBottom: 4,
  },
  overallScore: { flexDirection: "row", alignItems: "baseline" },
  overallScoreBig: { fontSize: 28, fontWeight: "800" },
  overallScoreMax: { fontSize: 15, color: "#aaa" },
  overallCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  overallCircleText: { fontSize: 22, fontWeight: "800" },
  overallDesc: { fontSize: 14, color: "#5a6a7a", lineHeight: 21 },
  zonesHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a2d4a",
    marginBottom: 14,
  },
  zoneCard: {
    backgroundColor: "#f8f9fd",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  zoneCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  zoneCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  zoneCardIcon: { fontSize: 26 },
  zoneCardLabel: { fontSize: 15, fontWeight: "700", color: "#1a2d4a" },
  zoneCardDesc: { fontSize: 12, color: "#8a9ab0", marginTop: 1 },
  zoneBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  zoneBadgeText: { fontSize: 12, fontWeight: "700" },
  zoneBarBg: {
    height: 7,
    backgroundColor: "#e4e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  zoneBarFill: { height: "100%", borderRadius: 4 },
  zoneScore: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 10,
    textAlign: "right",
  },
  zoneTip: { fontSize: 13, color: "#5a6a7a", lineHeight: 19 },
  doneBtn: {
    backgroundColor: "#375a85",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 30,
  },
  doneBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
});
