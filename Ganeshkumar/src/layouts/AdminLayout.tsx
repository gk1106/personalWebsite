import { NavLink, Outlet } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { Button } from "../components/ui/Button";
import { ToastProvider } from "../context/ToastContext";
import { useLogout } from "../hooks/useLogout";

/**
 * Deliberately plain — no GridBackground/glow treatment. The admin area
 * should read as a practical CMS, not another portfolio landing page, while
 * still using the same color tokens so dark/light theming stays consistent.
 */
export function AdminLayout() {
  const handleLogout = useLogout();

  return (
    <ToastProvider>
      <div className="flex min-h-svh flex-col bg-background">
        <a
          href="#admin-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <Container className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <NavLink to="/admin" className="font-mono text-lg font-semibold tracking-wide text-foreground">
                GK
              </NavLink>
              <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Admin
              </span>
            </div>

            <div className="flex items-center gap-3">
              <NavLink
                to="/"
                className="hidden font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-150 hover:text-foreground sm:inline"
              >
                View site
              </NavLink>
              <ThemeToggle />
              <Button variant="secondary" type="button" className="!px-4 !py-2 !text-xs" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </Container>
        </header>

        <main id="admin-main-content" className="flex-1">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}
