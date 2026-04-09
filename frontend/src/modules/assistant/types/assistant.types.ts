export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: Date | string;
}

export interface AssistantChatRequest {
  message: string;
}

export interface AssistantChatResponse {
  reply: string;
}
