import { useState } from "react";
import { FALLBACK_ARTWORK } from "@/lib/api/music";
import { cn } from "@/lib/utils";

interface ArtworkProps {
  src?: string | undefined;
  alt: string;
  className?: string;
  rounded?: string;
  eager?: boolean;
}

/** Image with graceful fallback for missing/broken artwork. */
export function Artwork({ src, alt, className, rounded = "rounded-xl", eager }: ArtworkProps) {
  const [errored, setErrored] = useState(false);
  const resolved = !src || errored ? FALLBACK_ARTWORK : src;

  return (
    <img
      src={resolved}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onError={() => setErrored(true)}
      className={cn("h-full w-full bg-muted object-cover", rounded, className)}
    />
  );
}
