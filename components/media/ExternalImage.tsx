'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';
import { resolveHighResImageUrl } from '@/lib/image-resolver';

interface ExternalImageProps {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  unoptimized?: boolean;
}

export function ExternalImage({
  src,
  alt = 'Product image',
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  quality = 90,
  unoptimized = true,
}: ExternalImageProps) {
  const resolvedSrc = resolveHighResImageUrl(src);
  const [hasError, setHasError] = useState(!resolvedSrc);

  if (hasError || !resolvedSrc) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 p-4 border border-dashed border-slate-300 dark:border-slate-700',
          fill ? 'w-full h-full absolute inset-0' : 'w-full h-full min-h-[140px]',
          className
        )}
        style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }}
      >
        <ImageOff className="w-8 h-8 opacity-60 mb-1" />
        <span className="text-[11px] font-medium tracking-wide uppercase text-center text-slate-500">
          MFE BRAND
        </span>
      </div>
    );
  }

  // If fill is true, Next.js Image requires parent with position: relative
  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
        className={cn('object-cover transition-opacity duration-300', className)}
        priority={priority}
        quality={quality}
        onError={() => setHasError(true)}
        unoptimized={unoptimized}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width || 800}
      height={height || 800}
      className={cn('object-cover rounded transition-opacity duration-300', className)}
      priority={priority}
      quality={quality}
      onError={() => setHasError(true)}
      unoptimized={unoptimized}
    />
  );
}
