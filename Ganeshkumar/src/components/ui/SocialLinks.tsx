import { Mail } from "lucide-react";
import { siteConfig } from "../../config/site";

interface SocialLinksProps {
  className?: string;
  iconSize?: number;
}

const iconLinkClasses =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-150 hover:border-secondary/40 hover:text-foreground focus-visible:text-foreground";

// lucide-react no longer ships brand/logo marks — these are minimal glyph-only
// SVGs (no background shape) sized to match lucide's icon API.
function GithubGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedinGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
    </svg>
  );
}

export function SocialLinks({ className = "", iconSize = 16 }: SocialLinksProps) {
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      <li>
        <a
          href={siteConfig.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${siteConfig.name} on GitHub`}
          className={iconLinkClasses}
        >
          <GithubGlyph size={iconSize} />
        </a>
      </li>
      <li>
        <a
          href={siteConfig.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${siteConfig.name} on LinkedIn`}
          className={iconLinkClasses}
        >
          <LinkedinGlyph size={iconSize} />
        </a>
      </li>
      <li>
        <a
          href={`mailto:${siteConfig.email}`}
          aria-label={`Email ${siteConfig.name}`}
          className={iconLinkClasses}
        >
          <Mail size={iconSize} aria-hidden="true" />
        </a>
      </li>
    </ul>
  );
}
