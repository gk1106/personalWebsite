import type { KeyboardEvent, RefObject } from "react";
import { Send } from "lucide-react";
import { CHAT_MESSAGE_MAX_LENGTH } from "../../services/chatService";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({ value, onChange, onSend, disabled, inputRef }: ChatInputProps) {
  const canSend = value.trim().length > 0 && !disabled;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends; Shift+Enter inserts a newline (the textarea's own default).
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border p-3">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, CHAT_MESSAGE_MAX_LENGTH))}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ask about Ganesh..."
        aria-label="Message the portfolio assistant"
        disabled={disabled}
        className="max-h-24 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:opacity-60"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={!canSend}
        aria-label="Send message"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:brightness-110 disabled:pointer-events-none disabled:opacity-40"
      >
        <Send size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
