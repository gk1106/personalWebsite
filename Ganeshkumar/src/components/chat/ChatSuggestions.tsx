const SUGGESTIONS = [
  "Tell me about Ganesh",
  "What projects has he built?",
  "What are his technical skills?",
  "Tell me about InsuranceAI",
];

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground transition-colors duration-150 hover:border-secondary/50 hover:text-secondary"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
