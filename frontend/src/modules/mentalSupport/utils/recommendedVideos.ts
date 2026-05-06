import { videos as breathingVideos } from "@/modules/mentalSupport/data/breathing";
import { sections as meditationSections } from "@/modules/mentalSupport/data/meditation";
import { videos as natureVideos } from "@/modules/mentalSupport/data/nature";
import { sections as trainingSections } from "@/modules/mentalSupport/data/trening";

type CategoryRoute =
  | "/(tabs)/mentalSupport/breathing"
  | "/(tabs)/mentalSupport/meditation"
  | "/(tabs)/mentalSupport/nature"
  | "/(tabs)/mentalSupport/training";

type BaseVideo = {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
};

export type RecommendedVideo = BaseVideo & {
  key: string;
  route: CategoryRoute;
  category: string;
};

const breathingPool: RecommendedVideo[] = breathingVideos.map((video) => ({
  ...video,
  key: `breathing-${video.id}`,
  route: "/(tabs)/mentalSupport/breathing",
  category: "Oddechowe",
}));

const naturePool: RecommendedVideo[] = natureVideos.map((video) => ({
  ...video,
  key: `nature-${video.id}`,
  route: "/(tabs)/mentalSupport/nature",
  category: "Dzwieki natury",
}));

const meditationPool: RecommendedVideo[] = meditationSections.flatMap((section) =>
  section.data.map((video) => ({
    ...video,
    key: `meditation-${video.id}`,
    route: "/(tabs)/mentalSupport/meditation" as const,
    category: "Medytacje",
  }))
);

const trainingPool: RecommendedVideo[] = trainingSections.flatMap((section) =>
  section.data.map((video) => ({
    ...video,
    key: `training-${video.id}`,
    route: "/(tabs)/mentalSupport/training" as const,
    category: "Trening",
  }))
);

const dedupeVideos = (videos: RecommendedVideo[]) => {
  const seen = new Set<string>();

  return videos.filter((video) => {
    if (seen.has(video.videoUrl)) {
      return false;
    }

    seen.add(video.videoUrl);
    return true;
  });
};

export const recommendedVideosPool = dedupeVideos([
  ...breathingPool,
  ...naturePool,
  ...meditationPool,
  ...trainingPool,
]);

export const getRandomRecommendedVideos = (limit: number) => {
  const shuffled = [...recommendedVideosPool];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(limit, shuffled.length));
};
