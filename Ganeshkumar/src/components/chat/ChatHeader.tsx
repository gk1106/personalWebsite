import { X } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
}

export function ChatHeader({ onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
      <div>
        <p className="font-mono text-sm font-semibold tracking-wide text-foreground">Portfolio Assistant</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Ask me about Ganesh, his projects, skills, and experience.
        </p>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
          Portfolio questions only
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close portfolio assistant"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-surface hover:text-foreground"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
