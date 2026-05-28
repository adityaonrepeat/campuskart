"use client";

import { useCallback, useState } from "react";
import imageCompression from "browser-image-compression";
import { generateUploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { X, ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const UploadDropzone = generateUploadDropzone<OurFileRouter>();

interface UploadedImage {
  url: string;
  key: string;
}

interface ImageUploaderProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  maxFiles = 5,
  disabled = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const removeImage = useCallback(
    (key: string) => {
      onChange(value.filter((img) => img.key !== key));
    },
    [value, onChange]
  );

  const canUploadMore = value.length < maxFiles;

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((img) => (
            <div key={img.key} className="relative aspect-square rounded-md overflow-hidden border">
              <Image
                src={img.url}
                alt="Listing image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 10vw"
              />
              <button
                type="button"
                onClick={() => removeImage(img.key)}
                disabled={disabled}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 3 - value.length) }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md border border-dashed flex items-center justify-center bg-muted/30"
            >
              <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
            </div>
          ))}
        </div>
      )}

      {canUploadMore && (
        <UploadDropzone
          endpoint="listingImages"
          config={{ mode: "auto" }}
          disabled={disabled || isUploading}
          className={cn(
            "border-dashed border-2 rounded-lg ut-label:text-sm ut-allowed-content:text-xs",
            isUploading && "opacity-50 pointer-events-none"
          )}
          onBeforeUploadBegin={async (files) => {
            setIsUploading(true);
            const compressed = await Promise.all(
              files.map((file) =>
                imageCompression(file, {
                  maxSizeMB: 1,
                  maxWidthOrHeight: 1920,
                  useWebWorker: true,
                  fileType: file.type as "image/jpeg" | "image/png" | "image/webp",
                })
              )
            );
            return compressed as File[];
          }}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            const newImages: UploadedImage[] = res.map((r) => ({
              url: r.ufsUrl ?? r.url,
              key: r.key,
            }));
            onChange([...value, ...newImages].slice(0, maxFiles));
          }}
          onUploadError={(error) => {
            setIsUploading(false);
            console.error("Upload error:", error.message);
          }}
        />
      )}

      <p className="text-xs text-muted-foreground">
        {value.length}/{maxFiles} images uploaded. Max 4MB each, compressed automatically.
      </p>
    </div>
  );
}
