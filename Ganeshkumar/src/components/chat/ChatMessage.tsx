import { motion, useReducedMotion } from "framer-motion";
import { parseInlineText } from "../../lib/parseInlineText";
import type { ChatMessage as ChatMessageData } from "../../types/chatMessage";

interface ChatMessageProps {
  message: ChatMessageData;
}

/**
 * User and assistant bubbles are deliberately distinguished by shape/position
 * AND color (not color alone): user messages align right in a filled primary
 * bubble; assistant messages align left with a neutral surface and a thin
 * secondary-accent edge, reusing parseInlineText for `code`/[links](url)
 * instead of rendering raw HTML.
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const prefersReducedMotion = useReducedMotion();
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border border-l-2 border-l-secondary/60 bg-surface-strong text-foreground"
        }`}
      >
        {isUser ? message.content : parseInlineText(message.content)}
      </div>
    </motion.div>
  );
}
