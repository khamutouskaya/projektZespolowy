import axios from "axios";
import { useRef, useState } from "react";
import { assistantApi } from "@/services/api/assistant";
import { Message } from "../types/assistant.types";

const createMessage = (role: Message["role"], text: string): Message => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  text,
  createdAt: new Date(),
});

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  // Load history or initialize session later if null
  const initSession = async () => {
    if (sessionId) return sessionId;
    try {
      const newSessionId = await assistantApi.createSession("New Session");
      setSessionId(newSessionId);
      return newSessionId;
    } catch (e) {
      console.error("Failed to create session", e);
      return null;
    }
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    const requestVersion = ++requestVersionRef.current;

    setMessages((prev) => [...prev, createMessage("user", trimmed)]);
    setIsLoading(true);

    try {
      const currentSessionId = await initSession();
      if (!currentSessionId) throw new Error("No session");

      const reply = await assistantApi.sendMessage(currentSessionId, text);
      if (requestVersion !== requestVersionRef.current) return;

      setMessages((prev) => [...prev, createMessage("assistant", reply)]);
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) return;
      const backendMessage = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      // Если что-то пошло не так — показываем ошибку в чате
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Что-то пошло не так. Попробуй ещё раз.",
        createdAt: new Date(),
      };
      errorMessage.text =
        backendMessage ||
        "Nie mogę teraz połączyć się z asystentem. Spróbuj ponownie za chwilę.";

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setIsLoading(false);
      }
    }
  };

  const clearChat = () => {
    requestVersionRef.current += 1;
    setMessages([]);
    setSessionId(null);
    setIsLoading(false);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
}
