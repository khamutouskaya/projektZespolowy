import { apiClient } from "../../services/api/client";
import { GardenSlotType } from "./garden.types";

export const gardenService = {
  async getGarden(): Promise<GardenSlotType[]> {
    const res = await apiClient.get("/Garden");
    return res.data;
  },

  async plantTree() {
    await apiClient.post("/Garden/plant");
  },

  async harvestTree(gardenBedId: string) {
    await apiClient.post(`/Garden/harvest/${gardenBedId}`);
  },
};