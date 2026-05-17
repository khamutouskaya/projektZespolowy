import { apiClient } from "./client";

interface SendMessageRequest {
  message: string;
  personalityHint?: string;
}

interface SendMessageResponse {
  reply: string; // то что ответил AI
}

interface TranscribeResponse {
  success: boolean;
  transcript?: string;
  error?: string;
}

interface TranscribeBackendResponse {
  success: boolean;
  transcript?: string;
  error?: string | null;
}

export const assistantApi = {
  sendMessage: async (message: string, personalityHint?: string): Promise<string> => {
    const response = await apiClient.post<SendMessageResponse>("/assistant/chat", {
      message,
      ...(personalityHint ? { personalityHint } : {}),
    });
    return response.data.reply;
  },

  transcribeAudio: async (audioUri: string): Promise<string> => {
    const formData = new FormData();
    const filename = audioUri.split('/').pop() || 'recording.m4a';

    formData.append('File', {
      uri: audioUri,
      name: filename,
      type: 'audio/m4a',
    } as any);
    formData.append('language', 'pl');

    const response = await apiClient.post<TranscribeBackendResponse>(
      "/speech/transcribe",
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      }
    );

    if (!response.data.success || !response.data.transcript) {
      throw new Error(response.data.error || 'Transkrypcja nie powiodła się');
    }

    return response.data.transcript;
  },
};
