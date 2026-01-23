---
title: "Infinite Scroll: Implementación Profesional con React y Intersection Observer"
date: "2026-01-23"
excerpt: "Guía completa sobre cómo implementar infinite scroll de forma optimizada en React usando Intersection Observer API. Incluye ejemplos prácticos, mejores prácticas y patrones de rendimiento."
category: "React"
tags: ["react", "infinite-scroll", "performance", "intersection-observer", "user-experience"]
author: "Claudia"
image: "/placeholder.svg?height=400&width=800"
readTime: "12 min"
---

# Infinite Scroll: Implementación Profesional con React

El **infinite scroll** es una técnica de UX muy popular que carga contenido automáticamente mientras el usuario navega. En lugar de hacer clic en "siguiente", el contenido se carga sin interrupciones cuando llegas al final de la página.

En este artículo, te enseñaré cómo implementarlo de forma profesional, optimizada y accesible.

## ¿Por qué Infinite Scroll?

### Ventajas
- ✅ **Experiencia fluida**: El usuario no necesita hacer clic en botones
- ✅ **Mejor engagement**: Mantiene al usuario explorando más contenido
- ✅ **Móvil-amigable**: Natural en dispositivos táctiles
- ✅ **Reducción de clics**: Menos fricción en la navegación

### Desventajas
- ⚠️ **Difícil llegar al footer**: El usuario nunca ve el final
- ⚠️ **Rendimiento**: Cargar muchos elementos puede ser pesado
- ⚠️ **Ancho de banda**: Se cargan más datos innecesarios
- ⚠️ **Accesibilidad**: Requiere consideraciones especiales

**Recomendación**: Usa infinite scroll para blogs, galerías o catálogos, pero considera un botón "Cargar más" como alternativa.

## Conceptos Fundamentales

### 1. Intersection Observer API

La **Intersection Observer API** es la forma moderna y eficiente de detectar cuándo un elemento entra en el viewport.

```javascript
// Sintaxis básica
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Elemento visible en viewport!')
    }
  })
}, {
  threshold: 0.1 // Se dispara cuando 10% del elemento es visible
})

// Observar un elemento
observer.observe(element)

// Dejar de observar
observer.unobserve(element)

// Detener completamente
observer.disconnect()
```

**Ventajas sobre scroll listener**:
- 📊 Mejor rendimiento (optimizado por el navegador)
- 🎯 Más preciso
- ⚡ No bloquea el thread principal
- 📱 Funciona bien en móvil

### 2. Estado y Paginación

Necesitas mantener:
- **Página actual**: Cuántos lotes has cargado
- **Posts mostrados**: Qué contenido está en pantalla
- **¿Hay más?**: Si quedan items por cargar

```javascript
const [displayedPosts, setDisplayedPosts] = useState([])
const [currentPage, setCurrentPage] = useState(1)
const [hasMore, setHasMore] = useState(true)

const POSTS_PER_PAGE = 6
```

## Implementación Paso a Paso

### Paso 1: Hook personalizado

Es buena práctica abstraer la lógica en un hook reutilizable:

```javascript
// hooks/useInfiniteScroll.ts
import { useEffect, useRef, useState } from 'react'

interface UseInfiniteScrollProps {
  items: any[]
  itemsPerPage?: number
}

export function useInfiniteScroll({
  items,
  itemsPerPage = 6
}: UseInfiniteScrollProps) {
  const [displayedItems, setDisplayedItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)

  // Inicializar con primer lote
  useEffect(() => {
    setDisplayedItems(items.slice(0, itemsPerPage))
    setHasMore(items.length > itemsPerPage)
  }, [items, itemsPerPage])

  // Configurar Intersection Observer
  useEffect(() => {
    if (!observerTarget.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayedItems((prev) => {
            const nextIndex = prev.length
            const newItems = items.slice(nextIndex, nextIndex + itemsPerPage)
            const allItems = [...prev, ...newItems]
            
            if (allItems.length >= items.length) {
              setHasMore(false)
            }
            
            return allItems
          })
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [hasMore, items, itemsPerPage])

  return {
    displayedItems,
    hasMore,
    observerTarget
  }
}
```

### Paso 2: Componente con Infinite Scroll

```typescript
// components/PostsGridAnimated.tsx
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { BlogCard } from './blog-card'
import { Post } from '@/lib/posts.types'

interface PostsGridAnimatedProps {
  posts: Post[]
  enableInfiniteScroll?: boolean
}

export function PostsGridAnimated({
  posts,
  enableInfiniteScroll = false
}: PostsGridAnimatedProps) {
  const { displayedItems, hasMore, observerTarget } = useInfiniteScroll({
    items: posts,
    itemsPerPage: 6
  })

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        <AnimatePresence mode="sync">
          {displayedItems.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: 'easeOut'
                }
              }}
              exit={{
                opacity: 0,
                y: -20,
                scale: 0.9,
                transition: { duration: 0.2 }
              }}
              layout
              className="w-full max-w-sm mx-auto"
            >
              <BlogCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Indicador de carga */}
      {enableInfiniteScroll && hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-slate-300 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### Paso 3: Uso en la página

```typescript
// app/categorias/page.tsx
import { PostsGridAnimated } from '@/components/posts-grid-animated'
import { getPostsByCategory } from '@/lib/posts.server'

export default async function Categorias() {
  const posts = getPostsByCategory('Todos')

  return (
    <PostsGridAnimated
      posts={posts}
      enableInfiniteScroll={true}
    />
  )
}
```

## Mejores Prácticas

### 1. Rendimiento

```javascript
// ❌ MAL: Renderizar todos los elementos
{allPosts.map(post => <Card post={post} />)}

// ✅ BIEN: Renderizar solo los visibles
{displayedPosts.map(post => <Card post={post} />)}
```

### 2. Threshold Optimization

```javascript
// Para contenido en lista vertical
const observer = new IntersectionObserver(
  callback,
  { threshold: 0.1 } // 10% visible es suficiente
)

// Para contenido crítico
{ threshold: 1.0 } // 100% debe ser visible
```

### 3. Manejo de Errores

```javascript
useEffect(() => {
  if (!observerTarget.current) return

  try {
    const observer = new IntersectionObserver(callback)
    observer.observe(observerTarget.current)
    return () => observer.disconnect()
  } catch (error) {
    console.error('Intersection Observer error:', error)
  }
}, [])
```

### 4. Accesibilidad

```javascript
// Agregar atributos accesibles
<div
  ref={observerTarget}
  role="status"
  aria-live="polite"
  aria-label="Cargando más posts"
>
  <LoadingIndicator />
</div>
```

### 5. Evitar Cargas Duplicadas

```javascript
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
  if (!entries[0].isIntersecting || isLoading) return
  
  setIsLoading(true)
  // Simular carga
  setTimeout(() => setIsLoading(false), 500)
}, [isLoading])
```

## Comparación: Infinite Scroll vs Load More

| Aspecto | Infinite Scroll | Load More |
|---------|---|---|
| **UX** | Fluida, sin clics | Requiere acción |
| **Performance** | Puede cargar más | Controlado |
| **Accesibilidad** | Requiere cuidado | Más simple |
| **Footer** | Nunca se ve | Siempre accesible |
| **Mobile** | Excelente | Bueno |

## Alternativas Modernas

### React Query + Infinite Queries

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage
})
```

### Virtual Scrolling

Para listas muy largas (1000+ items):

```typescript
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={10000}
  itemSize={35}
  width="100%"
>
  {Row}
</FixedSizeList>
```

## Debugging y Testing

### Prueba en DevTools

```javascript
// En la consola, simular scroll hasta el final
const element = document.querySelector('[data-observer-target]')
const rect = element.getBoundingClientRect()
console.log('Element position:', rect)
```

### Test unitario

```typescript
import { render, screen } from '@testing-library/react'

test('carga más posts al scrollear', () => {
  const { getByText } = render(
    <PostsGridAnimated posts={mockPosts} enableInfiniteScroll={true} />
  )
  
  expect(getByText(/Post 1/)).toBeInTheDocument()
})
```

## Checklist de Implementación

- ✅ Usar Intersection Observer (no scroll listener)
- ✅ Mostrar 6-10 items iniciales
- ✅ Indicador visual de carga
- ✅ Evitar cargas duplicadas
- ✅ Manejo de errores
- ✅ Accesibilidad (aria-live, role="status")
- ✅ Testing
- ✅ Botón "Cargar más" como fallback
- ✅ Lazy loading de imágenes
- ✅ Smooth scroll (opcional)

## Conclusión

El infinite scroll es una herramienta poderosa cuando se implementa correctamente. Usa **Intersection Observer**, mantén el código limpio en un hook personalizado, y siempre considera las necesidades de tus usuarios.

**Próximo paso**: Agrega skeleton loaders mientras carga, notificaciones toast, y botón de volver arriba para mejorar aún más la experiencia.

---

## Recursos

- [MDN Intersection Observer API](https://developer.mozilla.org/es/docs/Web/API/Intersection_Observer_API)
- [React Query Infinite Queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)
- [React Window (Virtual Scrolling)](https://github.com/bvaughn/react-window)
- [Web Vitals](https://web.dev/vitals/)
