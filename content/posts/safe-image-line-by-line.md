---
title: "SafeImage: explicación línea a línea (resumen por bloques)"
date: "2026-01-22"
excerpt: "Explicación detallada por bloques de `components/safe-image.tsx`"
category: "Next.js"
tags: [nextjs,image,responsive,explanation]
author: "Tu Nombre"
image: "/placeholder.svg?height=400&width=800"
---

# SafeImage: explicación por bloques

Este post descompone `components/safe-image.tsx` en bloques lógicos y explica qué hace cada sección. Está pensado para entender la intención y el comportamiento sin leer línea a línea el archivo completo.

## 1) Cabeceras e imports

```tsx
// components/safe-image.tsx
'use client'

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
```

- `'use client'`: declara que este componente se renderiza en el cliente (browser). Permite hooks como `useState`.
- `Image` (Next.js): componente optimizado de imágenes.
- `useState`, `useEffect`: hooks React para estado y efectos.
- `ImageOff`: icono para mostrar en fallbacks.

## 2) Tipos / Props

```tsx
interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  inline?: boolean;
}
```

- Define las props que acepta el componente. `width` y `height` se usan para calcular la relación de aspecto y límites.
- `inline` es un modo alternativo (imagen en línea en el texto).

## 3) Estados y variables iniciales

```tsx
const [hasError, setHasError] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const isExternal = src?.startsWith('http') || false;

const fallbackSrc = '/placeholder.svg';
```

- `hasError`: indica si hubo un error al cargar la imagen.
- `isLoading`: muestra skeleton mientras la imagen carga.
- `isExternal`: detección simple de URL externa para decidir si usar optimización de Next.js.
- `fallbackSrc`: ruta local por defecto si se quisiera usar.

## 4) Early return cuando `src` está vacío

```tsx
if (!src || src.trim() === '') {
  return inline ? (
    <FallbackInline alt={alt} width={width} height={height} />
  ) : (
    <FallbackComponent alt={alt} width={width} height={height} />
  );
}
```

- Evita intentar cargar una URL vacía. Devuelve un fallback inline o bloque según `inline`.

## 5) useEffect: pre-carga y detección de errores

```tsx
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
```

- Crea una instancia `Image()` para empezar la carga y detectar si ya está en caché (`img.complete`).
- Registra listeners `load` y `error` para actualizar `isLoading`/`hasError`.
- Limpia listeners en la limpieza del effect.

## 6) Manejo de error tras intentos de carga

```tsx
if (hasError) {
  return inline ? (
    <FallbackInline message="Esta imagen no existe" width={width} height={height} />
  ) : (
    <FallbackComponent message="Esta imagen no existe" width={width} height={height} />
  );
}
```

- Si `hasError` es true, muestra el fallback correspondiente con mensaje.

## 7) Rama `inline` (para imágenes pequeñas en línea)

- Envuelve la imagen en `span` con `max-width` para limitar el tamaño.
- Renderiza un `<img/>` nativo con `className="w-full h-auto object-cover"` para mantener proporciones y ser responsive.
- Usa `onLoad` y `onError` para actualizar estado.

Ventaja: más simple, no depende de `next/image`, buena para imágenes pequeñas/iconos.

## 8) Rama principal (bloque responsivo)

- El wrapper es un `div.relative` que usa `padding-top` calculado: `(height/width)*100%` para reservar espacio y mantener la relación de aspecto.
- Dentro se usa `next/image` con `fill` para ocupar el contenedor absoluto y escalar correctamente.
- `sizes` ayuda a `next/image` a pedir el tamaño correcto según viewport.
- `unoptimized={!isExternal}` decide si usar optimización de Next.js (ajusta según tu `next.config.js`).

## 9) Fallbacks: `FallbackComponent` y `FallbackInline`

- `FallbackComponent`: bloque centrado que muestra un icono (`ImageOff`) y texto.
- `FallbackInline`: versión compacta para `inline`, con `truncate` y tamaño controlado.

## 10) Recomendaciones rápidas

- Siempre pasar `alt`.
- Proveer dimensiones aproximadas (`width` y `height`) para evitar CLS (layout shift).
- Usar `priority` solo en imágenes críticas.
- Si necesitas `blurDataURL`/placeholder, ampliar el componente para aceptar `blurDataURL`.

---

Si quieres que genere el post complementario con el código completo y comentarios línea a línea, lo creo ahora (archivo separado). ¿Procedo a crear `content/posts/safe-image-annotated-code.md` con el código completo y anotaciones por línea?

---

**Navegación relacionada**

- Ver el código completo anotado: [SafeImage — código completo anotado](/blog/safe-image-annotated-code)
