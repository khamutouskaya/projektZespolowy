import { apiClient } from "./client";

export const assistantApi = {
  createSession: async (title?: string): Promise<string> => {
    // Send a JSON string if title exists, otherwise null or empty string
    const response = await apiClient.post<string>("/chat/session", title ? `"${title}"` : '""', {
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  },
  sendMessage: async (sessionId: string, message: string): Promise<string> => {
    const response = await apiClient.post<{ responce: string }>(
      "/chat/message",
      { sessionId, message },
    );
    return response.data.responce; 
  },
};
