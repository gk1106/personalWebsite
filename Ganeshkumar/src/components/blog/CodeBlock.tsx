interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="overflow-hidden rounded-panel border border-border bg-surface-strong">
      {language && (
        <div className="border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {language}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
}
