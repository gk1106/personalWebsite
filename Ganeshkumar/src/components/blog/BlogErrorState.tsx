import { GlassPanel } from "../ui/GlassPanel";
import type { BlogFetchError, BlogFetchErrorKind } from "../../services/blogService";

interface BlogErrorStateProps {
  error: BlogFetchError;
}

const MESSAGES: Record<BlogFetchErrorKind, { title: string; description: string }> = {
  network: {
    title: "Can't reach the backend right now.",
    description: "The notes service seems to be offline or unreachable. Please try again in a moment.",
  },
  server: {
    title: "Something went wrong on the server.",
    description: "The backend hit an unexpected error while loading notes. Please try again shortly.",
  },
  unexpected: {
    title: "Something went wrong.",
    description: "Notes couldn't be loaded right now. Please try again shortly.",
  },
};

/** Never renders raw error/stack-trace text — only a fixed, user-safe message per error kind. */
export function BlogErrorState({ error }: BlogErrorStateProps) {
  const { title, description } = MESSAGES[error.kind];

  return (
    <GlassPanel className="flex flex-col gap-2 p-6 text-sm">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-muted-foreground">{description}</p>
    </GlassPanel>
  );
}
