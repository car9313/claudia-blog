// src/components/blog-image.tsx
import Image from "next/image";
import React from "react";
import BlogImageClient from "./blog-image-client";

interface BlogImageProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  inline?: boolean;          // nueva: inline vs block
  priority?: boolean;        // nueva: next/image priority
  sizes?: string;            // nueva: sizes para next/image
  unoptimized?: boolean;     // opcional override
}

/**
 * BlogImage (Server Component mejorado)
 * - Soporta inline/block.
 * - Forward de priority y sizes a next/image.
 * - Mantiene un anchor para BlogImageClient que monta overlays sin romper hidratación.
 */
export function BlogImage({
  src = "/placeholder.svg",
  alt = "",
  width = 800,
  height = 400,
  className = "",
  inline = false,
  priority = false,
  sizes,
  unoptimized,
}: BlogImageProps) {
  const safeSrc = src || "/placeholder.svg";
  const isExternal =
    typeof safeSrc === "string" &&
    (safeSrc.startsWith("http://") || safeSrc.startsWith("https://"));

  // decide si permitimos optimización por defecto (si no se pasa un override)
  const effectiveUnoptimized = typeof unoptimized === "boolean" ? unoptimized : isExternal;

  // id estable por render (no importa que sea pseudo aleatorio; es serializable en SSR)
  const clientId = `blogimage-${Math.random().toString(36).slice(2, 9)}`;

  // wrapper classes: inline o block
  const wrapperClass = inline
    ? `inline-block relative ${className || ""}`.trim()
    : `my-6 relative ${className || ""}`.trim();

  // Si es inline no renderizamos figcaption por convención (puedes cambiar)
  if (inline) {
    return (
      <span className={wrapperClass} style={width ? { width: `${width}px` } : undefined}>
        {/* next/image en modo "intrinsic" con width/height (no usamos fill para inline) */}
        <Image
          src={safeSrc}
          alt={alt ?? ""}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          unoptimized={effectiveUnoptimized}
          style={{ display: "block", width: "100%", height: "auto", objectFit: "cover" }}
        />

        {/* anchor para que el client-component pueda encontrar el <figure>/<span> */}
        <div id={clientId} />

        {/* Monta client overlay — no altera estructura semántica inicial */}
        <BlogImageClient anchorId={clientId} alt={alt} />
      </span>
    );
  }

  // Block (por defecto): usamos figure + figcaption
  return (
    <figure className={wrapperClass}>
      <Image
        src={safeSrc}
        alt={alt ?? ""}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        unoptimized={effectiveUnoptimized}
        style={{ width: "100%", height: "auto", objectFit: "cover" }}
      />

      {/* anchor para BlogImageClient */}
      <div id={clientId} />

      {alt && (
        <figcaption className="mt-2 text-sm text-center text-muted-foreground">
          {alt}
        </figcaption>
      )}

      {/* Client overlay */}
      <BlogImageClient anchorId={clientId} alt={alt} />
    </figure>
  );
}
