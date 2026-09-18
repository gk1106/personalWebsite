interface ProfileImageProps {
  src?: string;
  initials?: string;
  alt?: string;
  size?: number;
  className?: string;
}

/**
 * Placeholder avatar. Renders an initials mark inside a glass ring until a
 * real profile photo is supplied — swap in `src` to render an <img> instead.
 */
export function ProfileImage({
  src,
  initials = "GK",
  alt = "",
  size = 160,
  className = "",
}: ProfileImageProps) {
  return (
    <div
      className={`glass relative flex items-center justify-center overflow-hidden rounded-full border-primary/30 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span
          role="img"
          aria-label={alt || "Profile placeholder"}
          className="font-mono text-2xl font-semibold tracking-wide text-primary"
        >
          {initials}
        </span>
      )}
    </div>
  );
}
