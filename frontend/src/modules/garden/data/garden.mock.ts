import { GardenSlotType } from "../garden.types";

export const mockGardenSlots: GardenSlotType[] = [
  { id: 1, tree: { plantedAt: "2026-04-27" }, x: 0, y: 0 },
  { id: 2, tree: { plantedAt: "2026-04-26" }, x: 1, y: 0 },

  { id: 3, tree: { plantedAt: "2026-04-25" }, x: 0, y: 1 },
  { id: 4, tree: { plantedAt: "2026-04-24" }, x: 1, y: 1 },

  { id: 5, tree: { plantedAt: "2026-04-23" }, x: 0, y: 2 },
  { id: 6, tree: { plantedAt: "2026-04-22" }, x: 1, y: 2 },
];