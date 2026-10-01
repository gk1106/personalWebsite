import { useEffect, useRef, useState } from "react";
import type { UIEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatSuggestions } from "./ChatSuggestions";
import { ChatInput } from "./ChatInput";
import { useChat } from "../../hooks/useChat";

const WELCOME_TEXT =
  "Hi! I'm Ganesh's portfolio assistant.\n\nAsk me about his experience, projects, skills, education, or technical work.";

const NEAR_BOTTOM_THRESHOLD_PX = 80;

function TypingIndicator() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex justify-start" aria-live="polite" aria-label="Portfolio assistant is typing">
      <div className="flex items-center gap-1 rounded-2xl border border-border border-l-2 border-l-secondary/60 bg-surface-strong px-3.5 py-3.5">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
            animate={prefersReducedMotion ? undefined : { opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Self-contained floating chat widget, mounted once at the layout level so it
 * persists (including its conversation) across route changes but resets on a
 * full page reload. Talks only to POST /api/chat — see services/chatService.
 */
export function PortfolioChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, error, send, retry } = useChat();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const skipFocusRestoreRef = useRef(true);
  const prefersReducedMotion = useReducedMotion();

  function close() {
    setIsOpen(false);
  }

  // Focus the input once the panel has mounted, and restore focus to the
  // trigger button when it closes — but never on the very first mount.
  useEffect(() => {
    if (skipFocusRestoreRef.current) {
      skipFocusRestoreRef.current = false;
      return;
    }

    if (isOpen) {
      const id = window.setTimeout(() => inputRef.current?.focus(), prefersReducedMotion ? 0 : 150);
      return () => window.clearTimeout(id);
    }

    triggerRef.current?.focus();
  }, [isOpen, prefersReducedMotion]);

  // Close on Escape, but only while the panel is open.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Auto-scroll to the latest message, but only if the user was already near
  // the bottom — scrolling up to read history is never interrupted.
  useEffect(() => {
    if (!isOpen || !isNearBottomRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "end" });
  }, [messages, isLoading, isOpen, prefersReducedMotion]);

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
  }

  function handleSend(message: string) {
    send(message);
    setInput("");
    isNearBottomRef.current = true;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label="Portfolio assistant"
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16, scale: prefersReducedMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : 12, scale: prefersReducedMotion ? 1 : 0.97 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
            className="glass fixed inset-0 z-[70] flex flex-col sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[620px] sm:w-[400px] sm:rounded-panel sm:shadow-2xl"
          >
            <ChatHeader onClose={close} />

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 ? (
                <div className="flex min-h-full flex-col justify-end gap-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {WELCOME_TEXT}
                  </p>
                  <ChatSuggestions onSelect={handleSend} />
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && <TypingIndicator />}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {error && (
              <div className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={retry}
                  className="shrink-0 font-medium text-secondary hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            <ChatInput
              value={input}
              onChange={setInput}
              onSend={() => handleSend(input)}
              disabled={isLoading}
              inputRef={inputRef}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open portfolio assistant"
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          className="fixed bottom-5 right-5 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background-elevated text-primary shadow-lg transition-colors duration-150 hover:border-primary/40"
        >
          <MessageCircle size={22} aria-hidden="true" />
        </motion.button>
      )}
    </>
  );
}
