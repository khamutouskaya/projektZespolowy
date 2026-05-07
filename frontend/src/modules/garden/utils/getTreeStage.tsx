export const getTreeStage = (plantedAt: string) => {
  const now = new Date();
  const planted = new Date(plantedAt);

  const diffTime = now.getTime() - planted.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 3) return 3;
  if (diffDays === 2) return 2;
  if (diffDays === 1) return 1;
  return 0;
};