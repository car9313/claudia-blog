"use client";

import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, RefreshCw } from "lucide-react";

interface BlogImageClientProps {
  anchorId: string;
  alt?: string;
  retryDelayMs?: number;
}

/**
 * BlogImageClient (mejorado)
 * - Detecta imagen ya fallida al montar (img.complete && naturalWidth === 0).
 * - Oculta <img> roto y muestra overlay con botón reintentar.
 * - No cambia la jerarquía DOM (no provoca hydration mismatch).
 */
export default function BlogImageClient({
  anchorId,
  alt,
  retryDelayMs = 200,
}: BlogImageClientProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [attempt, setAttempt] = useState<number>(0);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;

    const figure = anchor.closest("figure");
    if (!figure) return;

    const img = figure.querySelector("img") as HTMLImageElement | null;
    if (!img) return;

    let mounted = true;

    const onLoad = () => {
      if (!mounted) return;
      // fade in
      img.style.visibility = "visible";
      img.style.opacity = "1";
      img.style.transition = "opacity 300ms ease";
      setIsLoaded(true);
      setHasError(false);
    };

    const onError = () => {
      if (!mounted) return;
      // hide the broken img to avoid browser broken-icon
      try {
        img.style.visibility = "hidden";
        img.style.opacity = "0";
      } catch (e) {
        /* ignore style errors */
      }
      setHasError(true);
      setIsLoaded(false);
    };

    // Attach listeners first (so we don't miss events that occur immediately after)
    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);

    // Then inspect state synchronously:
    // If already complete:
    if (img.complete) {
      // naturalWidth === 0 => failed to load
      if (img.naturalWidth === 0) {
        // force the error handling path
        onError();
      } else {
        // already loaded (cache)
        onLoad();
      }
    } else {
      img.style.opacity = "0";
      img.style.visibility = "visible";
    }

    return () => {
      mounted = false;
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
    };
  }, [anchorId, attempt]);

  const handleRetry = () => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;
    const figure = anchor.closest("figure");
    if (!figure) return;
    const img = figure.querySelector("img") as HTMLImageElement | null;
    if (!img) return;

    // show loader / hide previous overlay
    setHasError(false);
    setIsLoaded(false);

    // Cache-bust: append timestamp or counter
    const rawSrc = img.getAttribute("src") ?? "";
    const cleanSrc = rawSrc.replace(/([?&])_r=\d+/g, "").replace(/[?&]$/, "");
    const separator = cleanSrc.includes("?") ? "&" : "?";
    const newSrc = `${cleanSrc}${separator}_r=${Date.now()}`;
    // Assign new src to force reload
    img.src = newSrc;

    // bump attempt so effect re-attaches listeners
    // small delay to allow browser to start loading
    setTimeout(() => setAttempt((s) => s + 1), retryDelayMs);
  };

  return (
    <div
      ref={rootRef}
      id={`${anchorId}-client-root`}
      aria-hidden
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      {/* Error overlay */}
      {hasError && (
        <div className="pointer-events-auto w-full h-full flex items-center justify-center">
          <div className="max-w-2xl w-full text-center bg-white/90 dark:bg-slate-900/70 border border-border rounded-lg p-6 mx-4">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-muted/10">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-sm text-muted-foreground">
                Imagen no disponible
              </div>

              <button
                onClick={handleRetry}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                type="button"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loader */}
      {!hasError && !isLoaded && (
        <div className="pointer-events-none w-full h-full flex items-center justify-center">
          <div className="animate-pulse w-3/4 h-48 bg-muted/10 rounded-md" />
        </div>
      )}
    </div>
  );
}
