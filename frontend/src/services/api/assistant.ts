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
    try {
    console.log("Rozpoczynam transkrypcję dla:", audioUri);

      const formData = new FormData();

      // Pobierz nazwę pliku z URI
      const filename = audioUri.split('/').pop() || 'recording.m4a';

      console.log("Nazwa pliku:", filename);

      // W React Native FormData akceptuje obiekt z uri, name i type
      formData.append('File', {
        uri: audioUri,
        name: filename,
        type: 'audio/m4a',
      } as any);

  formData.append('language', 'pl');

 // Użyj apiClient z odpowiednią konfiguracją dla multipart/form-data
      const response = await apiClient.post<TranscribeBackendResponse>(
        "/speech/transcribe",
        formData,
        {
          headers: {
'Content-Type': 'multipart/form-data',
 },
   // Nie pozwól axios transformować FormData
        transformRequest: (data) => data,
        }
      );

      console.log("Odpowiedź z serwera:", response.data);

      if (!response.data.success || !response.data.transcript) {
        throw new Error(response.data.error || 'Transkrypcja nie powiodła się');
      }

      return response.data.transcript;
    } catch (error: any) {
      console.error("Błąd transkrypcji szczegóły:", {
        message: error.message,
 response: error.response?.data,
        status: error.response?.status
});
      throw error;
    }
  },
};
