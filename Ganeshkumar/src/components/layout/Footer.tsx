import { Container } from "../ui/Container";
import { SocialLinks } from "../ui/SocialLinks";
import { siteConfig } from "../../config/site";

export function Footer() {
  const hasResume = Boolean(siteConfig.resumeUrl) && siteConfig.resumeUrl !== "#";

  return (
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">
            {siteConfig.name} ({siteConfig.shortName})
          </p>
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {siteConfig.roles.join(" · ")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:items-end">
          <SocialLinks />
          <a
            href={`mailto:${siteConfig.email}`}
            className="font-mono text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            {siteConfig.email}
          </a>
          {hasResume && (
            <a
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-wide text-primary transition-colors duration-150 hover:text-secondary"
            >
              Resume ↗
            </a>
          )}
        </div>
      </Container>
    </footer>
  );
}
