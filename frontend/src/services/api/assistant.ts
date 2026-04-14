import type {
  AssistantChatRequest,
  AssistantChatResponse,
} from "@/modules/assistant/types/assistant.types";
import { apiClient } from "./client";

export const assistantApi = {
  sendMessage: async (message: string) => {
    const payload: AssistantChatRequest = { message };
    const response = await apiClient.post<AssistantChatResponse>(
      "/assistant/chat",
      payload,
    );

    return response.data.reply;
  },
};
