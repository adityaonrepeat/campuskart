"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface StoreGalleryProps {
  storefront: string[];
  menu: string[];
  storeName: string;
}

type Lightbox = { images: string[]; index: number };

export function StoreGallery({ storefront, menu, storeName }: StoreGalleryProps) {
  const [lightbox, setLightbox] = useState<Lightbox | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const open = useCallback((images: string[], index: number) => setLightbox({ images, index }), []);
  const step = useCallback((dir: number) => {
    setLightbox((lb) =>
      lb ? { ...lb, index: (lb.index + dir + lb.images.length) % lb.images.length } : lb
    );
  }, []);

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

  if (storefront.length === 0 && menu.length === 0) return null;

  return (
    <div className="space-y-6 mb-6">
      {storefront.length > 0 && (
        <GallerySection label="Photos" images={storefront} storeName={storeName} onOpen={open} />
      )}
      {menu.length > 0 && (
        <GallerySection label="Menu" images={menu} storeName={storeName} onOpen={open} />
      )}

      {lightbox && (
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

          {lightbox.images.length > 1 && (
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

          <div
            className="relative w-full max-w-4xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.images[lightbox.index]}
              alt={storeName}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {lightbox.images.length > 1 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-white/70">
              {lightbox.index + 1} / {lightbox.images.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function GallerySection({
  label,
  images,
  storeName,
  onOpen,
}: {
  label: string;
  images: string[];
  storeName: string;
  onOpen: (images: string[], index: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {label}
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {images.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            onClick={() => onOpen(images, i)}
            className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted group"
          >
            <Image
              src={img}
              alt={`${storeName} — ${label} ${i + 1}`}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
