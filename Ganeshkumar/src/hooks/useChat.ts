import { useCallback, useRef, useState } from "react";
import { ChatFetchError, sendChatMessage } from "../services/chatService";
import type { ChatMessage } from "../types/chatMessage";

const FALLBACK_ERROR_MESSAGE =
  "Sorry, the portfolio assistant is temporarily unavailable. Please try again later.";

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content };
}

export interface UseChatResult {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  /** Adds a new user bubble and sends it. */
  send: (message: string) => void;
  /** Re-sends the last failed message without adding a duplicate user bubble. */
  retry: () => void;
}

/** Conversation lives only in React state — no localStorage, no backend memory. */
export function useChat(): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingMessageRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  const performRequest = useCallback(async (message: string) => {
    setError(null);
    setIsLoading(true);
    pendingMessageRef.current = message;
    const requestId = ++requestIdRef.current;

    try {
      const answer = await sendChatMessage(message);
      if (requestId !== requestIdRef.current) return;
      setMessages((prev) => [...prev, createMessage("assistant", answer)]);
      pendingMessageRef.current = null;
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof ChatFetchError ? err.message : FALLBACK_ERROR_MESSAGE);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  const send = useCallback(
    (rawMessage: string) => {
      const message = rawMessage.trim();
      if (!message || isLoading) return;

      setMessages((prev) => [...prev, createMessage("user", message)]);
      void performRequest(message);
    },
    [isLoading, performRequest],
  );

  const retry = useCallback(() => {
    if (!pendingMessageRef.current || isLoading) return;
    void performRequest(pendingMessageRef.current);
  }, [isLoading, performRequest]);

  return { messages, isLoading, error, send, retry };
}
