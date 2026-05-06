import * as SecureStore from "expo-secure-store";
import { GardenSlotType } from "./garden.types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const getToken = async () => {
  return await SecureStore.getItemAsync("token");
};

const authHeaders = async () => {
  const token = await getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const gardenService = {
  async getGarden(): Promise<GardenSlotType[]> {
    const res = await fetch(`${API_URL}/api/Garden`, {
      method: "GET",
      headers: await authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Nie udało się pobrać ogrodu");
    }

    return await res.json();
  },

  async plantTree() {
    const res = await fetch(`${API_URL}/api/Garden/plant`, {
      method: "POST",
      headers: await authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Nie udało się posadzić drzewa");
    }
  },

  async harvestTree(gardenBedId: string) {
    const res = await fetch(`${API_URL}/api/Garden/harvest/${gardenBedId}`, {
      method: "POST",
      headers: await authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Nie udało się zebrać drzewa");
    }
  },
};