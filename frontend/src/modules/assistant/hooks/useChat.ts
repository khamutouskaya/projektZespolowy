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
  // Список всех сообщений в чате
  const [messages, setMessages] = useState<Message[]>([]);
  // Текст в поле ввода
  const [inputText, setInputText] = useState("");
  // Идёт ли сейчас запрос (чтобы показать "печатает...")
  const [isLoading, setIsLoading] = useState(false);
  const requestVersionRef = useRef(0);

  const sendMessage = async (draftText?: string) => {
    // Не отправляем пустое сообщение
    const text = (draftText ?? inputText).trim();
    if (!text || isLoading) return;
    const requestVersion = ++requestVersionRef.current;

    // 1. Сразу добавляем сообщение пользователя в чат
    setMessages((prev) => [...prev, createMessage("user", text)]);
    setInputText(""); // очищаем поле ввода
    setIsLoading(true); // показываем "печатает..."

    try {
      // 2. Отправляем на бэкенд, ждём ответ
      const reply = await assistantApi.sendMessage(text);
      if (requestVersion !== requestVersionRef.current) return;

      // 3. Добавляем ответ AI в чат
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
    setInputText("");
    setIsLoading(false);
  };

  return {
    messages,
    inputText,
    setInputText,
    isLoading,
    sendMessage,
    clearChat,
  };
}
