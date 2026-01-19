// components/markdown-image-wrapper.tsx
'use client'

import { SafeImage } from './safe-image';

interface MarkdownImageWrapperProps {
  src: string;
  alt?: string;
}

export function MarkdownImageWrapper({ src, alt }: MarkdownImageWrapperProps) {
  if (!src) return null;
  
  // Determinar si es una imagen grande por el contexto
  const isLargeImage = alt?.toLowerCase().includes('[large]') || false;
  const cleanAlt = alt?.replace('[large]', '').replace('[small]', '').trim();
  
  return (
    <span className={`my-8 not-prose ${isLargeImage ? '' : 'max-w-2xl mx-auto'}`}>
      <SafeImage 
        src={src} 
        alt={cleanAlt || ''} 
        width={isLargeImage ? 1000 : 800}
        height={isLargeImage ? 500 : 400}
        className="rounded-lg shadow-lg"
        inline
      />
      {cleanAlt && (
        <span className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 italic block">
          {cleanAlt}
        </span>
      )}
    </span>
  );
}