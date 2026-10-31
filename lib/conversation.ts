export const MAX_CONVERSATION_MESSAGES = 6;
export const MAX_CONVERSATION_MESSAGE_LENGTH = 2_000;

export type ConversationRole = "user" | "assistant";

export type ConversationMessage = {
  role: ConversationRole;
  content: string;
};

export function normalizeConversation(value: unknown): ConversationMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null,
      content: typeof item.content === "string" ? item.content.trim().slice(0, MAX_CONVERSATION_MESSAGE_LENGTH) : "",
    }))
    .filter((item): item is ConversationMessage => item.role !== null && Boolean(item.content))
    .slice(-MAX_CONVERSATION_MESSAGES);
}
