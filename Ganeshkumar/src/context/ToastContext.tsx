import { createContext, useCallback, useState, type ReactNode } from "react";

export type ToastKind = "success" | "error";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  showToast: (kind: ToastKind, message: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;
const AUTO_DISMISS_MS = 4000;

/** Admin-scoped notification stack — deliberately not wired into the public app tree. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId++;
      setToasts((current) => [...current, { id, kind, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-panel px-4 py-3 text-sm ${
              toast.kind === "error" ? "border-red-500/40" : "border-primary/40"
            }`}
          >
            <span aria-hidden="true" className={toast.kind === "error" ? "text-red-400" : "text-primary"}>
              {toast.kind === "error" ? "!" : "✓"}
            </span>
            <span className="text-foreground">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
