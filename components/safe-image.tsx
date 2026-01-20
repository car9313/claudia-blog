// components/safe-image.tsx
'use client'

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  inline?: boolean;
}

export function SafeImage({
  src,
  alt,
  width = 800,
  height = 400,
  className = '',
  priority = false,
  inline = false,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isExternal = src?.startsWith('http') || false;
  
  // Fallback local
  const fallbackSrc = '/placeholder.svg';

  // Prevenir src vacío
  if (!src || src.trim() === '') {
    return inline ? (
      <FallbackInline alt={alt} width={width} height={height} />
    ) : (
      <FallbackComponent alt={alt} width={width} height={height} />
    );
  }

  // Detectar carga (incluye imágenes en caché) para ocultar el skeleton.
  useEffect(() => {
    if (!src) return;
    setIsLoading(true);
    setHasError(false);

    const img = new window.Image();
    img.src = src;
    if (img.complete) {
      setIsLoading(false);
      return;
    }
    const handleLoad = () => setIsLoading(false);
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };
    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  if (hasError) {
    // Mostrar mensaje específico de error cuando la imagen no carga
    return inline ? (
      <FallbackInline message="Esta imagen no existe" width={width} height={height} />
    ) : (
      <FallbackComponent message="Esta imagen no existe" width={width} height={height} />
    );
  }

  if (inline) {
    return (
      <span
        className={`inline-block mt-8 align-middle rounded-lg overflow-hidden shadow-lg ${className}`}
        style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }}
      >
        {isLoading && (
          <span className="w-full h-full block bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      </span>
    );
  }

  return (
    <div style={{ width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined }} className={`relative mt-8 rounded-lg overflow-hidden shadow-lg ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoadingComplete={() => setIsLoading(false)}
        /* sizes="(max-width: 768px) 100vw, 50vw" */
        priority={priority}
        unoptimized={!isExternal} // Solo optimizar externas
      />
    </div>
  );
}

function FallbackComponent({ alt, width, height, message }: { alt?: string; width: number; height: number; message?: string }) {
  const text = message || alt || 'Sin imagen';
  return (
    <div 
      className="flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden shadow-lg mt-8"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div className="text-center px-4">
        <ImageOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <span className="text-sm text-gray-500 block">{text}</span>
      </div>
    </div>
  );
}

function FallbackInline({ message, alt, width, height }: { message?: string; alt?: string; width?: number; height?: number }) {
  const text = message || alt || 'Sin imagen';
  const style = width || height ? { width: width ? `${width}px` : undefined, height: height ? `${height}px` : undefined } : undefined;
  return (
    <span
      className="inline-flex flex-col items-center justify-center text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-2 rounded-lg overflow-hidden shadow-lg mt-8"
      style={{ display: 'inline-block', ...style }}
    >
      <ImageOff className="w-6 h-6 text-gray-400 mb-1" />
      <span className="truncate text-center">{text}</span>
    </span>
  );
}