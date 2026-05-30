'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type AppImageProps = ImageProps & {
  fallbackSrc?: string;
};

export default function AppImage({ src, alt, fallbackSrc, className, ...props }: AppImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        setImgSrc(fallbackSrc ?? `https://placehold.co/400x300/F1F0EC/6B7280?text=${encodeURIComponent(alt.slice(0, 20))}`);
      }}
    />
  );
}
