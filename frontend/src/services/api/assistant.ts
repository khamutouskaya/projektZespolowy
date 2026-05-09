import { apiClient } from "./client";

interface SendMessageRequest {
  message: string; // то что написал пользователь
}

interface SendMessageResponse {
  reply: string; // то что ответил AI
}

interface TranscribeResponse {
  success: boolean;
  transcript?: string;
  error?: string;
}

// Backend zwraca pola z wielkiej litery (C# convention)
interface TranscribeBackendResponse {
  Success: boolean;
  Transcript?: string;
  Error?: string;
}

export const assistantApi = {
  sendMessage: async (message: string): Promise<string> => {
    const response = await apiClient.post<SendMessageResponse>(
 "/assistant/chat", // ← endpoint на твоём C# бэкенде
      { message },
    );
    return response.data.reply; // возвращаем только текст ответа
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

      if (!response.data.Success || !response.data.Transcript) {
        throw new Error(response.data.Error || 'Transkrypcja nie powiodła się');
      }

      return response.data.Transcript;
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
