import { GlassPanel } from "../ui/GlassPanel";
import { Button } from "../ui/Button";
import type { AdminApiError, AdminApiErrorKind } from "../../services/adminBlogService";

interface AdminErrorStateProps {
  error: AdminApiError;
  onRetry?: () => void;
}

const MESSAGES: Record<AdminApiErrorKind, { title: string; description: string }> = {
  unauthorized: { title: "Your session has ended.", description: "Please sign in again to continue." },
  forbidden: { title: "Access denied.", description: "Your account doesn't have permission to do this." },
  "not-found": { title: "Not found.", description: "This post doesn't exist or has already been removed." },
  conflict: { title: "This slug is already in use.", description: "Please choose another." },
  validation: { title: "Please check the form.", description: "Some fields need attention before this can be saved." },
  network: { title: "Can't reach the backend right now.", description: "Check that the backend is running and try again." },
  server: { title: "Something went wrong on the server.", description: "Please try again shortly." },
  unexpected: { title: "Something went wrong.", description: "Please try again shortly." },
};

/** Never renders a raw error message except the backend's own safe validation/conflict text. */
export function AdminErrorState({ error, onRetry }: AdminErrorStateProps) {
  const { title, description } = MESSAGES[error.kind];
  const showBackendMessage = error.kind === "validation" || error.kind === "conflict";

  return (
    <GlassPanel className="flex flex-col items-start gap-3 p-6 text-sm">
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-muted-foreground">{showBackendMessage ? error.message : description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" type="button" onClick={onRetry} className="!px-4 !py-2 !text-xs">
          Try again
        </Button>
      )}
    </GlassPanel>
  );
}
