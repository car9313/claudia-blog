---
title: "Búsquedas seguras en Next.js:Control de concurrencia"
date: "2026-01-08"
excerpt: "Búsquedas seguras en Next.js: Client Components, Server Actions, API Routes y control de concurrencia"
category: "Next.js"
tags: [nextjs,server-actions,debounce, useRef]
author: "Tu Nombre"
image: "/placeholder.svg?height=400&width=800"
---

# Búsquedas seguras en Next.js: Client Components, Server Actions, API Routes y control de concurrencia

En este post resumo todo lo que vimos durante mis ejercicios con Next.js: cuándo ejecutar código en el cliente o en el servidor, cómo usar **Server Actions** para acceder a `fs`/DB/secretos, la alternativa con **API Routes**, y el patrón esencial para evitar respuestas obsoletas en búsquedas (debounce + `reqId` + `useRef`). Incluyo ejemplos listos para copiar, diagramas ASCII y una **regla mental reusable** que podrás aplicar en cualquier proyecto.

---

## Resumen rápido (para leer antes de dormir)
- **Client Component (`'use client'`)**: UI + hooks + estado. Todo lo importado ahí se ejecuta en el navegador y se incluye en el bundle. Evita importar módulos Node-only (`fs`, `path`, ORMs, `process.env` no `NEXT_PUBLIC_`, etc.).
- **Server Action**: función marcada para ejecutarse en servidor y que puedes llamar desde un Client Component; ideal para `fs`/DB/secretos sin exponerlos.
- **API Route**: endpoint HTTP server-side (app/api/...) que llamas con `fetch` desde el cliente; útil si necesitas un contrato HTTP reutilizable, control de headers o caching HTTP.
- **Debounce**: reduce la cantidad de llamadas.
- **`reqId` + `useRef`**: patrón para **invalidar** respuestas antiguas cuando varias peticiones async están vivas al mismo tiempo.
- **`startTransition`**: marca actualizaciones no urgentes para mejorar la sensación de fluidez cuando aplicar resultados es costoso.

---

# Conceptos clave

## 1. Por qué no puedes usar `fs` (u otros módulos Node) en un Client Component
Los Client Components se ejecutan en el navegador. Si importas un módulo Node-only, el bundler fallará o el runtime dará errores (`Module not found: Can't resolve 'fs'` o `fs is not supported in the browser`). La regla es simple: **código Node = servidor**.

## 2. Server Actions vs API Routes (cuándo usar cada una)
- **Server Actions**
  - Ideal cuando la lógica es server-only y forma parte de la UX.
  - Menos boilerplate: llamas la función y Next la ejecuta en servidor.
  - Limitaciones: no es un endpoint HTTP público; no se puede abortar desde cliente (no `AbortController`).
- **API Routes**
  - Ideal cuando necesitas un endpoint HTTP reutilizable (móvil, terceros), control de headers, cache-control o uso de `signal` / `AbortController`.
  - Permite cancelar peticiones desde cliente con `AbortController`.

---

# Patrón esencial: Debounce + reqId (`useRef`) (la razón de ser)

### Problema
Usuario escribe rápido: `r → re → rea → reac → react`. Si cada cambio lanza una búsqueda async, las respuestas pueden llegar **fuera de orden**. Resultado: la UI puede mostrar resultados de una búsqueda antigua.

### Solución (dos capas)
1. **Debounce**: reduce llamadas (espera X ms sin teclear).
2. **Control de vigencia** (reqId + `useRef`): cada llamada async crea un `reqId` único; se guarda en un `ref` compartido. Cuando una promesa responde, **solo** actualiza el estado si su `reqId` === `lastReqRef.current`. Si no, se ignora.

### Regla mental (memorizable)
> **“En cualquier operación async disparada varias veces, solo debe poder ganar la última.”**

---

# Diagrama visual (línea de tiempo ASCII)

Escenario: el usuario escribe `r → re → rea → reac → react`.

```
TIEMPO ───────────────────────────────────────────►

Usuario escribe:
   r        re        rea        reac       react
   |         |          |           |           |
   ▼         ▼          ▼           ▼           ▼

Requests:
   A         B          C           D           E
 reqId=1   reqId=2    reqId=3     reqId=4     reqId=5

lastReqRef.current:
           (1) → (2) → (3) → (4) → (5)  // siempre contiene el último id

Resolución (fuera de orden):
 Promesa C termina → reqId 3  => lastReqRef.current === 5 => IGNORAR
 Promesa A termina → reqId 1  => lastReqRef.current === 5 => IGNORAR
 Promesa E termina → reqId 5  => lastReqRef.current === 5 => ACEPTAR (actualiza UI)
```

Solo la respuesta cuyo `reqId` coincide con `lastReqRef.current` en el momento de resolverse actualiza el estado.

---

# `useRef`: por qué "persiste" entre renders (explicación simple)

- `useRef(initial)` crea un objeto `{ current: initial }` que **se mantiene** durante toda la vida del componente.
- React **no recrea** ese objeto en cada render. Es la forma de tener una variable "mutable" que no provoca re-renders.
- Por eso `lastReqRef.current` puede cambiar mientras hay promesas pendientes y cada promesa puede comparar su `reqId` (local) contra el `ref` compartido.

---

# Código: implementación completa (lista para copiar)

A continuación los archivos principales (estructurados para seguir SRP/SOLID).

---

### `lib/posts.types.ts` (tipos — client-safe)
```ts
// lib/posts.types.ts
export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  tags: string[]
  readTime: string
  date: string
  published: boolean
  image?: string
}
```

---

### `lib/posts.server.ts` (server-only: usa fs, path, gray-matter)
```ts
// lib/posts.server.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Post } from './posts.types'

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

function ensurePostsDir() {
  if (!fs.existsSync(postsDirectory)) fs.mkdirSync(postsDirectory, { recursive: true })
}

export function getAllPosts(): Post[] {
  ensurePostsDir()
  const fileNames = fs.readdirSync(postsDirectory).filter((f) => f.endsWith('.md'))
  const posts: Post[] = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '')
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    return {
      id: slug,
      slug,
      title: data.title || 'Sin título',
      excerpt: data.excerpt || '',
      content: content || '',
      category: data.category || 'General',
      author: data.author || 'Anónimo',
      tags: data.tags || [],
      readTime: data.readTime || '5 min',
      date: data.date || new Date().toISOString().split('T')[0],
      published: data.published !== false,
      image: data.image,
    }
  })
  return posts.filter((p) => p.published).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function searchPosts(search: string): Post[] {
  const q = (search ?? '').toString().trim()
  if (!q) return []
  const all = getAllPosts()
  const lower = q.toLowerCase()
  return all.filter((p) => p.title.toLowerCase().includes(lower))
}
```

---

### `app/actions/searchPosts.ts` (Server Action)
```ts
// app/actions/searchPosts.ts
'use server'
import type { Post } from '@/lib/posts.types'
import { searchPosts } from '@/lib/posts.server'

export async function searchPostsServer(query: string): Promise<Post[]> {
  const q = (query ?? '').toString().trim()
  if (!q) return []
  return searchPosts(q)
}
```

---

### `hooks/use-debounce.ts`
```ts
// hooks/use-debounce.ts
import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
```

---

### `components/SearchDialog.tsx` (Client Component — implementa debounce + reqId)
```tsx
// components/SearchDialog.tsx
'use client'
import React, { useState, useEffect, useRef, useCallback, startTransition } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import type { Post } from '@/lib/posts.types'
import { BlogCard } from './blog-card'
import { searchPostsServer } from '@/app/actions/searchPosts'
import { useDebounce } from '@/hooks/use-debounce'

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const debouncedQuery = useDebounce(query, 500)
  const lastReqRef = useRef<number>(0)

  const performSearch = useCallback((searchQuery: string) => {
    const q = (searchQuery ?? '').toString().trim()
    if (!q) {
      setResults([])
      setHasSearched(false)
      setIsLoading(false)
      lastReqRef.current = 0
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    const reqId = Date.now() + Math.random()
    lastReqRef.current = reqId

    startTransition(() => {
      searchPostsServer(q)
        .then((data) => {
          if (lastReqRef.current !== reqId) return
          setResults(data ?? [])
        })
        .catch((err) => {
          console.error('Search error:', err)
          if (lastReqRef.current !== reqId) return
          setResults([])
        })
        .finally(() => {
          if (lastReqRef.current !== reqId) return
          setIsLoading(false)
        })
    })
  }, [])

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      setHasSearched(false)
      setIsLoading(false)
      lastReqRef.current = 0
      return
    }
    performSearch(debouncedQuery)
  }, [debouncedQuery, performSearch])

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setQuery('')
      setResults([])
      setHasSearched(false)
      lastReqRef.current = 0
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-accent">
          <Search className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Posts</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search for posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
            aria-label="Search posts"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => {
                setQuery('')
                setResults([])
                setHasSearched(false)
                lastReqRef.current = 0
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto mt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Searching...</span>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No posts found for "{query}"</p>
            </div>
          )}

          {!isLoading && !hasSearched && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Start typing to search for posts</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((post) => (
                <div key={post.id} onClick={() => setOpen(false)}>
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

# Buenas prácticas y checklist (SOLID y arquitectura)
- **SRP**: separa lectura/parsing (`lib/*.server.ts`) de la UI (`components/*`) y de los tipos (`lib/*.types.ts`).
- **No exponer secretos**: guarda claves en env vars server-only; nunca uses `NEXT_PUBLIC_` para secretos.
- **Debounce + Vigencia**: debounce para reducir llamadas, `reqId`/`useRef` para vigencia.
- **Testing**: unit tests para `getAllPosts()` (mock fs), integration para API route o Server Action.
- **Performance**: usa `startTransition` si aplicar resultados causa re-render costoso.
- **Caching**: si los posts cambian poco, considera cache HTTP (API) o índice (lunr/sqlite FTS) en server.

---

# Ejercicios sugeridos (para dominarlo)
1. Implementa la versión Server Action tal como está arriba. Verifica que `fs` no aparece en el bundle.  
2. Crea una API Route `/api/search` que llame a `searchPosts` y compara latencias y manejo (usa `AbortController`).  
3. Añade búsqueda en `title + excerpt + tags` y paginación.  
4. Reemplaza la búsqueda por un índice lunr o sqlite FTS si la carpeta crece mucho.  
5. Escribe tests unitarios para `getAllPosts()` y pruebas E2E para el flujo SearchDialog.

---

# Conclusión
Con este patrón tienes una solución robusta y reproducible para búsquedas en Next.js que:
- protege secretos y permite usar `fs`/DB con Server Actions o API Routes,
- evita mostrar resultados obsoletos gracias a `reqId` + `useRef`,
- mejora UX con debounce y `startTransition`,
- respeta buenas prácticas de arquitectura (SRP/SOLID) y testabilidad.

Si quieres, puedo:
- exportarte este `.md` en un archivo listo para descargar,
- generar la versión alternativa usando API Route + `AbortController`,
- o añadir tests ejemplo (vitest/jest) para `getAllPosts()` y para `SearchDialog`.

¿Quieres que genere el archivo `.md` descargable ya?
