export type MessageRole = "user" | "assistant";
// "user"      — сообщение от пользователя (справа, цветной пузырёк)
// "assistant" — ответ AI (слева, серый пузырёк)

export interface Message {
  id: string; // уникальный ID — нужен для FlatList
  role: MessageRole; // кто написал
  text: string; // текст сообщения
  createdAt: Date; // время — чтобы показывать "12:34"
}
