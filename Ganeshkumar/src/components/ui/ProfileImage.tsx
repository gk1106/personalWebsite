import { useState } from "react";

interface ProfileImageProps {
  src?: string;
  initials?: string;
  alt?: string;
  size?: number;
  className?: string;
}

/**
 * Renders the supplied photo, cropped/positioned via object-cover, or an
 * initials placeholder when no `src` is given — and falls back to the same
 * placeholder if the image fails to load.
 */
export function ProfileImage({
  src,
  initials = "GK",
  alt = "",
  size = 160,
  className = "",
}: ProfileImageProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(src) && !imageFailed;

  return (
    <div
      className={`glass relative flex items-center justify-center overflow-hidden rounded-full border-primary/30 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
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
