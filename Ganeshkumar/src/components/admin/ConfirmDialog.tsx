import { useEffect, useRef } from "react";
import { Button } from "../ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Native <dialog> with showModal(): built-in focus trapping, Escape-to-close,
 * and a ::backdrop — an accessible modal without a component library.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      className="glass fixed top-1/2 left-1/2 m-0 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-panel border border-border p-6 text-foreground backdrop:bg-black/60"
    >
      <h2 id="confirm-dialog-title" className="text-lg font-semibold text-foreground">
        {title}
      </h2>
      <p id="confirm-dialog-description" className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" type="button" disabled={busy} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={busy}
          onClick={onConfirm}
          className={destructive ? "!bg-red-600 hover:!brightness-110 focus-visible:!outline-red-600" : ""}
        >
          {busy ? "Please wait…" : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
