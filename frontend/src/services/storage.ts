import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "auth_access_token";
//const REFRESH_TOKEN_KEY = "auth_refresh_token"; // dla ew. refresh tokenów
const USER_KEY = "auth_user";

export const storage = {
  // --- OBSŁUGA TOKENÓW ---
  getToken: async () => {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },
  /*
  getRefreshToken: async () => {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    //W razie czego będzie tu można dorzucić refresh token
  },
  */

  saveToken: async (accessToken: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    //W razie czego będzie tu można dorzucić refresh token
  },

  clearToken: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    //W razie czego będzie tu można dorzucić refresh token
  },

  // --- OBSŁUGA UŻYTKOWNIKA ---
  saveUser: async (userJson: string) => {
    await SecureStore.setItemAsync(USER_KEY, userJson);
  },

  getUser: async () => {
    return await SecureStore.getItemAsync(USER_KEY);
  },
  removeUser: async () => {
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
