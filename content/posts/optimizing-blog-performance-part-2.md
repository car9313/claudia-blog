---
title: "Optimización de rendimiento: tratamiento del resaltado de código (Shiki)"
date: "2026-01-30"
excerpt: "Segunda parte: opciones para eliminar el coste runtime del resaltado de código con Shiki (precompute, lazy load, cache global)."
category: "Performance"
tags: ["nextjs", "shiki", "highlight", "performance"]
author: "Claudia"
image: "/placeholder.svg"
---

# Optimización de rendimiento: tratamiento del resaltado de código (Shiki)

Esta segunda parte detalla la estrategia para abordar el mayor coste restante en la ruta del post: la inicialización y ejecución de Shiki para generar HTML resaltado en `CodeBlock`.

## Problema

`CodeBlock` utiliza `highlightCode` que invoca `getHighlighter()` (internamente `createHighlighter()` de Shiki). La primera inicialización de Shiki puede ser costosa (descarga de temas/langs, CPU para parseo), lo que impacta el tiempo de render server-side en la primera petición.

## Opciones de solución

1. Precomputar el HTML resaltado en build-time (recomendado cuando el contenido es mayoritariamente estático)

- Implementación: escribir un script Node (`scripts/highlight-posts.js`) que recorra `content/posts/*.md`, extraiga bloques de código (`lang`), use Shiki para convertir a HTML y reemplace o adjunte el HTML resaltado como campo adicional en un cache JSON (por ejemplo `content/cache/highlighted.json`) o directamente en el markdown (no recomendado por complicar edición).
- Ventajas: coste de resaltado fuera del path de petición; `CodeBlock` puede renderizar el HTML precomputado sin inicializar Shiki en runtime.
- Contras: necesitas re-run del script en cada cambio de post (integrar en `pnpm build` es ideal).

2. Lazy load / client-side highlighting

- Mover el resaltado al cliente: renderizar el bloque de código de forma simple en server, y en un componente client cargar Shiki (o una librería ligera) para reemplazar el contenido posteriormente.
- Ventajas: server responde rápido; el cliente aplica highlight progresivamente.
- Contras: añade JS al cliente y cambia la UX (resaltado aparece después). No es ideal para SEO si el código debe estar resaltado en el server.

3. Mantener Shiki en servidor pero mejorar el cache y la inicialización

- Guardar `highlighter` en `globalThis.__SHIKI_HIGHLIGHTER__` para servidores persistentes y evitar re-creación en hot restarts.
- En entornos serverless la ganancia es limitada, pero en VPS/containers persistentes es efectiva.

## Ejemplo de script de precompute (esbozo)

````js
// scripts/highlight-posts.js
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createHighlighter } from "shiki";

async function run() {
  const postsDir = path.join(process.cwd(), "content", "posts");
  const highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
  });

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  const cache = {};

  for (const file of files) {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { content } = matter(raw);

    // extraer bloques ```lang\ncode\n```
    const codeBlocks = [];
    const regex = /```(\w+)\n([\s\S]*?)```/g;
    let m;
    while ((m = regex.exec(content))) {
      const lang = m[1];
      const code = m[2];
      const html = highlighter.codeToHtml(code, {
        lang,
        theme: "github-light",
      });
      codeBlocks.push({ lang, html });
    }

    cache[file.replace(/\.md$/, "")] = codeBlocks;
  }

  fs.mkdirSync(path.join(process.cwd(), "content", "cache"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(process.cwd(), "content", "cache", "highlighted.json"),
    JSON.stringify(cache, null, 2),
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
````

Integración en `package.json`

```json
"scripts": {
  "build": "next build",
  "highlight:build": "node scripts/highlight-posts.js",
  "build:with-highlight": "pnpm run highlight:build && pnpm run build"
}
```

## Conclusión

El primer paso que implementamos (cache en `getAllPosts()` y evitar relecturas) reduce significativamente trabajo I/O redundante. El siguiente objetivo —y la mayor ganancia posible— es sacar Shiki del path de petición con precomputado en build o mover el trabajo al cliente según prioridades (SEO vs experiencia progresiva).

Si lo deseas, puedo:

1. Añadir el script `scripts/highlight-posts.js` completo y la integración en `package.json`.
2. Implementar `CodeBlock` para leer `content/cache/highlighted.json` y renderizar HTML precomputado.

Indica cuál prefieres y lo implemento en una nueva rama.
