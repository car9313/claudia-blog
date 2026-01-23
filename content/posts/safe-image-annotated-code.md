---
title: "SafeImage: código completo anotado"
date: "2026-01-22"
excerpt: "Código completo de `components/safe-image.tsx` con comentarios explicativos por línea/bloque"
category: "Next.js"
tags: [nextjs,image,responsive,annotated]
author: "Tu Nombre"
image: "/placeholder.svg?height=400&width=800"
---

# SafeImage — código completo anotado

> Navegar a: [Explicación por bloques](/blog/safe-image-line-by-line)

A continuación se muestra el archivo `components/safe-image.tsx` completo con anotaciones que explican qué hace cada bloque o línea importante. Puedes usar esto como referencia para entender o modificar el componente.

```tsx
// components/safe-image.tsx
'use client' // Este componente corre en el cliente (permite hooks)

import Image from 'next/image'; // Componente de imagen optimizada de Next.js
import { useState, useEffect } from 'react'; // Hooks React
import { ImageOff } from 'lucide-react'; // Icono para fallback

interface SafeImageProps { // Tipado de props
  src: string; // URL o ruta de la imagen
  alt: string; // texto alternativo para accesibilidad
  width?: number; // ancho objetivo (px) usado para aspect-ratio / max-width
  height?: number; // alto objetivo (px)
  className?: string; // clases adicionales para el wrapper
  priority?: boolean; // si la imagen es prioritaria para Next.js
  inline?: boolean; // modo inline: usa <img/> nativo y comportamiento responsivo simple
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
  // Estado: si la imagen presentó error al cargar
  const [hasError, setHasError] = useState(false);
  // Estado: si la imagen está en carga (mostrar skeleton)
  const [isLoading, setIsLoading] = useState(true);
  // Detección simple de URL externa para decidir optimización
  const isExternal = src?.startsWith('http') || false;

  // Ruta fallback local (no siempre usada, pero útil como referencia)
  const fallbackSrc = '/placeholder.svg';

  // Early return: si no hay src válido, mostramos fallback (inline o bloque)
  if (!src || src.trim() === '') {
    return inline ? (
      <FallbackInline alt={alt} width={width} height={height} />
    ) : (
      <FallbackComponent alt={alt} width={width} height={height} />
    );
  }

  // useEffect: detecta si la imagen carga correctamente o falla
  useEffect(() => {
    if (!src) return; // protección
    setIsLoading(true); // empezar loader
    setHasError(false); // resetear error

    // Creamos una instancia Image del navegador para pre-cargar y detectar estado
    const img = new window.Image();
    img.src = src;

    // Si la imagen ya está en caché, img.complete será true
    if (img.complete) {
      setIsLoading(false);
      return;
    }

    // Handlers para load / error
    const handleLoad = () => setIsLoading(false);
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Cleanup: eliminar listeners al desmontar o al cambiar src
    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  // Si ocurrió un error, mostrar fallback con mensaje
  if (hasError) {
    return inline ? (
      <FallbackInline message="Esta imagen no existe" width={width} height={height} />
    ) : (
      <FallbackComponent message="Esta imagen no existe" width={width} height={height} />
    );
  }

  // Modo inline: usamos <img/> nativo, con max-width y h-auto para responsividad
  if (inline) {
    return (
      <span
        className={`inline-block mt-8 align-middle rounded-lg overflow-hidden shadow-lg ${className}`}
        style={{ display: 'inline-block', maxWidth: width ? `${width}px` : '100%' }}
      >
        {isLoading && (
          <span className="w-full h-full block bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={`w-full h-auto object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      </span>
    );
  }

  // Modo bloque/responsive: wrapper relativo con padding-top para mantener aspect-ratio
  return (
    <div
      className={`relative mt-8 rounded-lg overflow-hidden shadow-lg ${className}`}
      style={{ width: '100%', paddingTop: width && height ? `${(height / width) * 100}%` : undefined }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ objectFit: 'cover' }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        onLoadingComplete={() => setIsLoading(false)}
        priority={priority}
        unoptimized={!isExternal} // Solo optimizar externas
      />
    </div>
  );
}

// Fallback para bloque
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

// Fallback inline
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
```

---

> Volver a: [Explicación por bloques](/blog/safe-image-line-by-line)
