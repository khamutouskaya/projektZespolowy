export type GardenTreeStage = 0 | 1 | 2 | 3 | 4;

export type GardenSlotType = {
  id: string;
  treeState: GardenTreeStage;
  x: number;
  y: number;
};

export type GardenStatusType = {
  beds: GardenSlotType[];
  fruitsBalance: number;
};