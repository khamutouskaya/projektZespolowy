export type GardenTreeStage = 0 | 1 | 2 | 3;

export type GardenTreeType = {
  plantedAt: string;
};

export type GardenSlotType = {
  id: number;
  tree: GardenTreeType | null;
  x: number;
  y: number;
};