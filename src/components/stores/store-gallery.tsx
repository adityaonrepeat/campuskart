"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface StoreGalleryProps {
  images: string[];
  storeName: string;
  /** Badges rendered over the main image (top corners). */
  overlay?: React.ReactNode;
  emptyIcon?: string;
}

export function StoreGallery({ images, storeName, overlay, emptyIcon = "🏪" }: StoreGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const safeActive = Math.min(active, Math.max(images.length - 1, 0));
  const hasMany = images.length > 1;

  const close = useCallback(() => setLightbox(false), []);
  const step = useCallback(
    (dir: number) => setActive((p) => (p + dir + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, close, step]);

  return (
    <div>
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-border aspect-4/3 mb-3">
        {images.length > 0 ? (
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Enlarge photo"
            className="block w-full h-full"
          >
            <Image
              src={images[safeActive]}
              alt={storeName}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </button>
        ) : (
          <div className="w-full h-full bg-linear-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
            <span className="text-7xl opacity-30">{emptyIcon}</span>
          </div>
        )}

        {overlay}

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/55 text-white text-[11px] font-medium pointer-events-none">
              {safeActive + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasMany && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0 ${
                safeActive === i ? "border-accent shadow-md" : "border-border hover:border-accent/40"
              }`}
            >
              <Image src={img} alt={`${storeName} ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && images.length > 0 && (
        <div
          className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4 sm:p-8"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {hasMany && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="Previous"
                className="absolute left-3 sm:left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="Next"
                className="absolute right-3 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="relative w-full max-w-4xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[safeActive]}
              alt={storeName}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {hasMany && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-white/70">
              {safeActive + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
