import { apiClient } from "./client";

interface SendMessageRequest {
  message: string; // то что написал пользователь
}

interface SendMessageResponse {
  reply: string; // то что ответил AI
}

export const assistantApi = {
  sendMessage: async (message: string): Promise<string> => {
    const response = await apiClient.post<SendMessageResponse>(
      "/assistant/chat", // ← endpoint на твоём C# бэкенде
      { message },
    );
    return response.data.reply; // возвращаем только текст ответа
  },
};
