import { apiClient } from "../../services/api/client";
import { GardenStatusType } from "./garden.types";

export const gardenService = {
  async getGarden(): Promise<GardenStatusType> {
    const res = await apiClient.get("/Garden");
    return res.data;
  },

  async plantTree(gardenBedId: string) {
    await apiClient.post(`/Garden/plant/${gardenBedId}`);
  },

  async harvestTree(gardenBedId: string): Promise<{ coinsBalance: number }> {
    const res = await apiClient.post(`/Garden/harvest/${gardenBedId}`);
    return res.data;
  },

  async exchangeFruit() {
    await apiClient.post("/Garden/exchange-fruit");
  },
};