---
title: "Cómo funciona `SafeImage`"
date: "2026-01-22"
excerpt: "Explicación detallada del componente SafeImage: propósito, estados y reutilización"
category: "Next.js"
tags: [nextjs,image,responsive,components]
author: "Tu Nombre"
image: "/placeholder.svg?height=400&width=800"

---

# Cómo funciona `SafeImage`

Este artículo explica en detalle el componente `SafeImage` ubicado en `components/safe-image.tsx`: su propósito, comportamiento interno, y cómo reutilizarlo en tu proyecto Next.js.

## Propósito

`SafeImage` es un componente de utilidad que envuelve la gestión de imágenes para:

- Hacer que las imágenes sean responsivas y mantengan buen aspecto en distintos tamaños de pantalla.
- Manejar estados de carga (skeleton) y errores (fallback) de forma elegante.
- Soportar imágenes internas y externas (con control de optimización de Next.js).
- Permitir un modo `inline` para imágenes pequeñas o icon-like que no ocupan bloque completo.

## Props principales

- `src: string` — ruta de la imagen (local o externa).
- `alt: string` — texto alternativo.
- `width?: number` — ancho objetivo para calculo de relación de aspecto o límite `max-width`.
- `height?: number` — alto objetivo para calculo de relación de aspecto.
- `className?: string` — clases CSS/Tailwind adicionales para el wrapper.
- `priority?: boolean` — si se debe marcar como `priority` para `next/image`.
- `inline?: boolean` — modo inline (usa una etiqueta `<img/>` simple con `max-width`).

## Comportamiento interno (resumen)

1. Validación de `src`: si no hay `src` o está vacío, el componente muestra un fallback (`FallbackComponent` o `FallbackInline`).
2. Detección de carga: usa la API `Image()` del navegador para detectar `load`/`error` y controlar el `isLoading` local.
3. Manejo de errores: si la carga falla, `hasError` activa el fallback con un ícono y mensaje.
4. Modo `inline`: cuando `inline` es `true`, el componente renderiza una etiqueta `<img>` con `className` que aplica `w-full h-auto` y un `max-width` basado en la prop `width`.
5. Modo bloque/responsive: en el modo por defecto el componente usa `next/image` con la prop `fill` y un wrapper relativo que usa `padding-top` para mantener la relación de aspecto, logrando que la imagen ocupe el ancho disponible y escale proporcionalmente.
6. Optimización: se detecta si `src` es externa (`startsWith('http')`) para decidir `unoptimized` (en el código actual se marca `unoptimized={!isExternal}` — ajustar según tu configuración de `next.config.js`).

## Por qué usar `fill` con un wrapper

`next/image` expone la prop `fill` para posicionar la imagen de forma absoluta dentro de un contenedor relativo. Para mantener la proporción, el wrapper aplica `padding-top: (height/width)*100%`. Esto permite:

- La imagen se escala fluidamente al ancho del contenedor.
- Mantener la relación de aspecto sin conocer el ancho final (útil en grids y layouts responsivos).

Matemáticamente, la altura del wrapper se establece con:

$$\text{padding-top} = \frac{height}{width} \times 100\%$$

## Ejemplos de uso

1) Uso básico (bloque, responsive):

```tsx
import { SafeImage } from '@/components/safe-image';

export default function PostHeader() {
  return (
    <article>
      <SafeImage
        src="/images/hero.jpg"
        alt="Foto de ejemplo"
        width={1200}
        height={600}
        className="rounded-lg"
        priority
      />
    </article>
  );
}
```

2) Uso inline (icono o imagen pequeña en texto):

```tsx
<SafeImage src="/images/logo-small.png" alt="Logo" inline width={120} />
```

3) Uso con imágenes externas:

```tsx
<SafeImage src="https://example.com/photo.jpg" alt="Remota" width={800} height={450} />
```

Nota: Si tu `next.config.js` no permite dominios externos, añade el host en `images.domains` o permite `unoptimized` según prefieras.

## Reutilización y buenas prácticas

- Siempre pasar `alt` descriptivo para accesibilidad.
- Para contenidos de blog usa `width`/`height` reales (o aproximadas) para mejores placeholders y evitar saltos de layout.
- Usa `priority` solo en imágenes críticas (hero/header) para no bloquear carga de otras imágenes.
- Ajusta `sizes` si necesitas control fino del comportamiento responsive para `next/image`.
- Si usas Tailwind, agrega utilidades en `className` para bordes, sombras, etc. El wrapper principal ya aplica `rounded-lg overflow-hidden shadow-lg` por defecto.

## Extensiones posibles

- Añadir `loading="lazy"` condicionalmente para el modo inline (si usas `<img>` directo).
- Permitir pasar `objectFit` y `objectPosition` como props para mayor control.
- Detectar `src` remota con más robustez (por ejemplo, soportar `//cdn.example.com`).
- Integrar placeholders blur usando `blurDataURL` cuando la imagen es optimizable por Next.js.

## Comprobación local

Para ver los cambios en tu entorno local:

```bash
pnpm dev
# o
npm run dev
```

Visita las páginas donde uses `SafeImage` y prueba emulación de device en el navegador (DevTools → Toggle device toolbar) para verificar comportamiento responsive.

## Código relevante (resumen)

El componente tiene las piezas clave:

- Estado `isLoading` y `hasError`.
- Fallbacks `FallbackComponent` y `FallbackInline`.
- Modo `inline` que renderiza `<img class="w-full h-auto" />` con `max-width`.
- Modo bloque que renderiza `next/image` con `fill` dentro de un wrapper con `padding-top` calculado.

Si quieres, puedo incluir fragmentos exactos del archivo `components/safe-image.tsx` en este post para referencia directa.

---

¿Deseas que incluya ejemplos visuales con screenshots o fragmentos de código adicionales (por ejemplo, cómo habilitar dominios remotos en `next.config.js`)?
