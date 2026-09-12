'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface ExternalImageProps {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
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
}: ExternalImageProps) {
  const [hasError, setHasError] = useState(!src);

  if (hasError || !src) {
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
        src={src}
        alt={alt}
        fill
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        className={cn('object-cover transition-opacity duration-300', className)}
        priority={priority}
        onError={() => setHasError(true)}
        unoptimized
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 600}
      height={height || 600}
      className={cn('object-cover rounded transition-opacity duration-300', className)}
      priority={priority}
      onError={() => setHasError(true)}
      unoptimized
    />
  );
}
