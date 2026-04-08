import { useState } from "react";
import { cn } from "../../lib/utils";

type ImagePreviewProps = {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function ImagePreview({ src, alt, className, imageClassName }: ImagePreviewProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cn("flex items-center justify-center rounded-3xl bg-white/70 p-8", className)}>
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-50" />
          <p className="mt-4 text-sm text-muted">Image unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-3xl bg-white/70", className)}>
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover transition duration-500 hover:scale-[1.02]", imageClassName)}
      />
    </div>
  );
}
