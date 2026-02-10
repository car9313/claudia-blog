---
title: "Optimización de rendimiento: cache de posts y reducción de I/O en un blog Next.js"
date: "2026-01-30"
excerpt: "Detalle técnico de los cambios realizados para reducir TTFB y mejorar la experiencia en la página de artículo (cache en memoria, refactor de lecturas, uso responsable de recursos)."
category: "Performance"
tags: ["nextjs","performance","optimization","shiki","cache"]
author: "Claudia"
image: "/placeholder.svg"
---

# Optimización de rendimiento: cache de posts y reducción de I/O en un blog Next.js

Este artículo documenta, con detalle técnico y profesional, las implementaciones realizadas para mejorar los tiempos de carga de la página de lectura de un post (ruta `app/blog/[slug]`) en este proyecto. Los cambios se enfocaron en reducir operaciones de I/O y parsing repetido, y en organizar mejor cómo se obtienen los datos para evitar trabajo innecesario durante la renderización server-side.

Resumen de cambios aplicados

- Añadido un cache en memoria (module-level) para el resultado de `getAllPosts()` en `lib/posts.server.ts`. El cache se activa solo en producción (`NODE_ENV === 'production'`).
- Expuesto `clearPostsCache()` para invalidar cache cuando sea necesario.
- `getRelatedPosts` ahora acepta un parámetro opcional `allPosts?: Post[]` para reutilizar la lista ya parseada y evitar relecturas.
- Refactor en `app/blog/[slug]/page.tsx` para invocar `getAllPosts()` una sola vez por petición, buscar el post en ese array y pasar `allPosts` a la función de relacionados.

Por qué era necesario

Antes de estos cambios la página de post hacía varias operaciones de lectura y parseo de archivos Markdown en una sola petición:

1. `getPostBySlug(slug)` leía y parseaba el archivo específico del post.
2. `relatedPostsServer(post)` (y/o `getRelatedPosts`) volvía a invocar `getAllPosts()` que a su vez leía y parseaba todos los archivos Markdown.
3. La propia página además llamaba `getAllPosts()` para calcular prev/next.

Todo esto significaba múltiples lecturas de disco y ejecuciones de `gray-matter` por la misma petición — incluso en casos donde la lista de posts no cambia frecuentemente en producción. El resultado: TTFB alto y peor percepción de carga.

Detalles de la implementación

1) Cache en memoria para `getAllPosts()`

- Implementación: módulo‑level `let postsCache: Post[] | null = null` y función `clearPostsCache()`.
- Lógica: `getAllPosts()` comprueba `process.env.NODE_ENV` y usa cache solamente si `NODE_ENV === 'production'`. En desarrollo se omite la cache para que los editores vean cambios en caliente.
- Ventajas: evita I/O y parsing repetido por petición en servidores persistentes (droplets, VPS, contenedores con long running process).
- Riesgos: contenido editado no se refleja hasta invalidar o reiniciar el proceso; mitigación: `clearPostsCache()` o webhook para invalidación.

2) Evitar relecturas: pasar `allPosts` a helpers

- `getRelatedPosts` ahora tiene la firma `getRelatedPosts(post, limit = 3, allPosts?: Post[])`.
- De esta forma, la página puede llamar `const allPosts = getAllPosts()` una vez y reutilizar esa lista tanto para prev/next como para calcular relacionados: `getRelatedPosts(post, 3, allPosts)`.
- Esto elimina llamadas redundantes a `fs.readFileSync`/`gray-matter` durante la misma petición.

3) Cambios en la página del post

- `app/blog/[slug]/page.tsx` fue modificado para obtener `allPosts` al inicio, localizar el `post` filtrando `allPosts`, y pasar `allPosts` a `relatedPostsServer(post, allPosts)`.
- Resultado: solo un parseo de archivos por petición (si cache está en producción este coste se amortiza aún más).

Medición y verificación

Pasos para medir localmente (modo producción — simula entorno real):

```bash
pnpm build
NODE_ENV=production pnpm start
curl -w "TTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" -o /dev/null -s http://localhost:3000/blog/ejemplo-post
```

Recomiendo tomar 3 mediciones antes y después de desplegar los cambios en producción y comparar los promedios. Se espera una reducción notable del TTFB cuando la lectura/parsing dominaba la latencia.

Limitaciones y próximos pasos

- Si el cuello de botella real viene de la inicialización de Shiki (resaltado de código), este cambio ofrece mejoras moderadas pero no elimina ese coste. Pasos siguientes para Shiki:
  1. Precomputar resaltado en build-time (script que genere HTML resaltado por post y lo guarde como campo o JSON). Esto evita inicializar `createHighlighter()` en runtime.
  2. O bien, lazy-load del highlight en el cliente para no bloquear la renderización server-side.
- Para infraestructuras serverless (Vercel/Netlify), la cache sólo vive por instancia y la ganancia es por instancia; aun así reduce trabajo por petición en instancias calientes.

Conclusión

El cambio aplicado es de bajo riesgo y alto impacto: con una inversión mínima en líneas de código se reduce I/O redundante y parsing en la ruta de entrega de contenido, mejorando TTFB y la percepción de la carga inicial. Este es el primer paso recomendado antes de invertir en soluciones más complejas (precomputed highlighting, CDN adicional, caching distribuido).

En la parte 2 (si interesa) detallaré la estrategia para abordar el coste de Shiki (precompute vs lazy client highlight), con scripts y ejemplos concretos para integrarlo en el pipeline de build.
