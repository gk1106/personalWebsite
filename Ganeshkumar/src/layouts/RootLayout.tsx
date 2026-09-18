import { Outlet } from "react-router-dom";
import { GridBackground } from "../components/ui/GridBackground";
import { Navbar } from "../components/layout/Navbar";
import { Container } from "../components/ui/Container";

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <GridBackground />
      <Navbar />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8">
        <Container className="flex flex-col items-center gap-1 text-center text-sm text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <span>&copy; {new Date().getFullYear()} GaneshKumar</span>
          <span className="font-mono text-xs uppercase tracking-widest">Built with React &amp; TypeScript</span>
        </Container>
      </footer>
    </div>
  );
}
