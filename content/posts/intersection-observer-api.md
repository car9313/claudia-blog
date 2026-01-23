---
title: "Intersection Observer API: La Guía Definitiva para Detectar Visibilidad de Elementos"
date: "2026-01-23"
excerpt: "Domina la Intersection Observer API: desde conceptos básicos hasta casos de uso avanzados. Aprende a detectar cuándo elementos entran en el viewport de forma eficiente y optimizada."
category: "JavaScript"
tags: ["intersection-observer", "javascript", "performance", "web-api", "vanilla-js"]
author: "Claudia"
image: "/placeholder.svg?height=400&width=800"
readTime: "15 min"
---

# Intersection Observer API: La Guía Definitiva

La **Intersection Observer API** es una de las características más poderosas y subutilizadas del navegador moderno. Te permite detectar cuándo un elemento entra o sale del viewport (área visible) de forma eficiente, sin bloquear el hilo principal.

Antes de Intersection Observer, detectar visibilidad requería listeners complejos que hacían scroll lento. Ahora, el navegador se encarga de manera optimizada.

## ¿Qué es Intersection Observer?

Intersection Observer es una **Web API** que notifica cuándo un elemento entra o sale de una región específica (generalmente el viewport).

```javascript
// Ejemplo básico
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('¡El elemento está visible!')
    }
  })
})

observer.observe(document.getElementById('mi-elemento'))
```

**Analógicamente**: Es como tener un vigilante invisible que te avisa exactamente cuándo algo entra o sale de tu campo de visión.

## ¿Por qué es revolucionario?

### Antes de Intersection Observer (❌ Antiguo)

```javascript
// ❌ MALO: Scroll listener en cada pixel
window.addEventListener('scroll', () => {
  const element = document.getElementById('target')
  const rect = element.getBoundingClientRect()
  
  // Se ejecuta CIENTOS de veces mientras scrolleas
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    console.log('Visible')
  }
})
```

**Problemas**:
- 📉 Se dispara en cada pixel de scroll (100+ veces/segundo)
- 🔥 Consume mucho CPU
- ⚡ Causa "jank" (lag) visual
- 💾 Cálculos repetitivos y costosos

### Ahora con Intersection Observer (✅ Moderno)

```javascript
// ✅ BIEN: Intersection Observer optimizado
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Visible')
    }
  })
})

observer.observe(document.getElementById('target'))
// Se dispara SOLO cuando cruza el umbral
```

**Ventajas**:
- ⚡ Se dispara solo cuando el elemento cruza el umbral
- 🚀 Optimizado por el navegador (usa renderización nativa)
- 💪 No bloquea el hilo principal
- ⚙️ Cálculos automáticos y precisos

## Compatibilidad

| Navegador | Soporte |
|-----------|---------|
| Chrome | ✅ v51+ |
| Firefox | ✅ v55+ |
| Safari | ✅ v12.1+ |
| Edge | ✅ v16+ |
| IE 11 | ❌ No (usar polyfill) |

Hoy en día, más del 95% de los navegadores lo soportan.

## API: Sintaxis Completa

### Crear un Observer

```javascript
const observer = new IntersectionObserver(
  callback,    // Función que se dispara
  options      // Configuración opcional
)
```

### Callback - El Corazón del Observer

```javascript
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    // entry es un IntersectionObserverEntry
    console.log({
      target: entry.target,           // El elemento observado
      isIntersecting: entry.isIntersecting,  // ¿Está visible?
      intersectionRatio: entry.intersectionRatio, // % visible (0-1)
      boundingClientRect: entry.boundingClientRect, // Posición
      rootBounds: entry.rootBounds,   // Límites del root
      time: entry.time                // Timestamp
    })
  })
})
```

### Opciones de Configuración

```javascript
const options = {
  // Elemento que actúa como "ventana" (null = viewport)
  root: null,
  
  // Margen alrededor del root (ejemplo: dispara 100px antes)
  rootMargin: '100px',
  
  // % de visibilidad para disparar el callback
  // Número: 0-1 (0.5 = 50% visible)
  // Array: [0, 0.25, 0.5, 0.75, 1]
  threshold: 0.1
}

const observer = new IntersectionObserver(callback, options)
```

## Ejemplos Prácticos

### 1. Lazy Loading de Imágenes

```javascript
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      
      // Cargar imagen real desde data-src
      img.src = img.dataset.src
      img.classList.add('loaded')
      
      // Dejar de observar esta imagen
      imageObserver.unobserve(img)
    }
  })
}, { threshold: 0.1 })

// Observar todas las imágenes lazy
document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img)
})
```

**HTML**:
```html
<img data-src="imagen-real.jpg" alt="Lazy loaded">
```

### 2. Carga Infinita (Infinite Scroll)

```javascript
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Llegaste al final, cargando más posts...')
      loadMorePosts()
    }
  })
}, { threshold: 0.5 })

// Observar el elemento centinela al final
const sentinel = document.querySelector('[data-infinite-scroll-trigger]')
scrollObserver.observe(sentinel)
```

### 3. Animaciones al Entrar en Pantalla

```javascript
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Agregar clase de animación
      entry.target.classList.add('fade-in')
      
      // Opcional: ejecutar solo una vez
      animationObserver.unobserve(entry.target)
    }
  })
}, { threshold: 0.3 })

document.querySelectorAll('[data-animate]').forEach(el => {
  animationObserver.observe(el)
})
```

**CSS**:
```css
[data-animate] {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

[data-animate].fade-in {
  opacity: 1;
  transform: translateY(0);
}
```

### 4. Analytics: Tracking de Secciones Visibles

```javascript
const sectionTracker = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Enviar evento de análisis
      gtag('event', 'section_visible', {
        section: entry.target.id,
        timestamp: new Date().toISOString()
      })
    }
  })
}, { threshold: 0.5 })

document.querySelectorAll('section').forEach(section => {
  sectionTracker.observe(section)
})
```

## Opciones Avanzadas

### rootMargin: Zona de Amortiguación

```javascript
// Dispara 100px ANTES de que el elemento entre en pantalla
const observer = new IntersectionObserver(callback, {
  rootMargin: '100px'
})

// Múltiples márgenes (arriba, derecha, abajo, izquierda)
rootMargin: '100px 50px 0px 50px'

// Negativo: dispara después de que salga
rootMargin: '-50px'
```

**Caso de uso**: Cargar imágenes antes de que sean visibles para que aparezcan instantáneamente.

### threshold: Múltiples Umbrales

```javascript
// Dispara en 0%, 25%, 50%, 75% y 100% de visibilidad
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      console.log(`Visibilidad: ${(entry.intersectionRatio * 100).toFixed(0)}%`)
    })
  },
  { threshold: [0, 0.25, 0.5, 0.75, 1] }
)
```

### root: Observer dentro de Scroll Container

```javascript
// Observar dentro de un contenedor scrolleable específico
const scrollContainer = document.querySelector('.horizontal-scroll')

const observer = new IntersectionObserver(callback, {
  root: scrollContainer,
  threshold: 0.8
})

scrollContainer.querySelectorAll('.card').forEach(card => {
  observer.observe(card)
})
```

## Caso de Uso Real: Galería con Lazy Loading y Analytics

```javascript
class SmartGallery {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector)
    this.images = this.container.querySelectorAll('img[data-src]')
    this.setupObserver()
  }

  setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: null,
        rootMargin: '50px',
        threshold: [0, 0.5, 1]
      }
    )

    this.images.forEach(img => this.observer.observe(img))
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      const img = entry.target

      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        // Cargar imagen
        this.loadImage(img)

        // Tracking
        this.trackImageView(img.id)
      }
    })
  }

  loadImage(img) {
    if (img.src) return // Ya cargada

    const src = img.dataset.src
    img.onload = () => {
      img.classList.add('loaded')
      this.observer.unobserve(img)
    }
    img.src = src
  }

  trackImageView(imageId) {
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({
        event: 'image_view',
        imageId,
        timestamp: Date.now()
      })
    })
  }

  destroy() {
    this.observer.disconnect()
  }
}

// Uso
const gallery = new SmartGallery('.gallery')
```

## Métodos principales

| Método | Descripción |
|--------|-------------|
| `observe(element)` | Comenzar a observar un elemento |
| `unobserve(element)` | Dejar de observar un elemento |
| `disconnect()` | Detener completamente el observer |

```javascript
// Observar
observer.observe(document.getElementById('target'))

// Dejar de observar
observer.unobserve(target)

// Limpiar todo
observer.disconnect()
```

## Propiedades del IntersectionObserverEntry

```javascript
observer.observe((entries) => {
  const entry = entries[0]

  // Datos importantes
  entry.target              // El elemento que entró/salió
  entry.isIntersecting      // boolean: ¿está visible?
  entry.intersectionRatio   // 0-1: % de visibilidad
  entry.boundingClientRect  // DOMRect: posición del elemento
  entry.intersectionRect    // DOMRect: parte visible
  entry.rootBounds         // DOMRect: límites del root
  entry.time               // DOMHighResTimeStamp
})
```

## Mejores Prácticas

### 1. Limpiar Observers

```javascript
// ❌ MALO: Memory leak
const observer = new IntersectionObserver(callback)
observer.observe(el)
// ... el nunca se limpia

// ✅ BIEN: Limpiar en cleanup
useEffect(() => {
  const observer = new IntersectionObserver(callback)
  observer.observe(el)
  
  return () => observer.disconnect()
}, [])
```

### 2. Reutilizar un Observer para Múltiples Elementos

```javascript
// ❌ MALO: Un observer por elemento
const imgs = document.querySelectorAll('img')
imgs.forEach(img => {
  const observer = new IntersectionObserver(callback)
  observer.observe(img)
}) // Crea N observers

// ✅ BIEN: Un observer para todos
const observer = new IntersectionObserver(callback)
imgs.forEach(img => observer.observe(img)) // Un único observer
```

### 3. Optimizar Threshold

```javascript
// ❌ MALO: Demasiados umbrales
threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]

// ✅ BIEN: Solo los necesarios
threshold: 0.5 // O [0, 0.5, 1] si necesitas más precisión
```

### 4. Manejar Errores

```javascript
const observer = new IntersectionObserver((entries) => {
  try {
    entries.forEach(entry => {
      if (!entry.target) return // Validar
      // ... tu lógica
    })
  } catch (error) {
    console.error('Observer error:', error)
  }
})
```

### 5. Performance: Unobserve después de Usar

```javascript
// Para lazy loading: observar solo una vez
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadResource(entry.target)
      observer.unobserve(entry.target) // 🎯 ¡Importante!
    }
  })
})
```

## Debugging

### Ver qué está siendo observado

```javascript
// En DevTools console
observer // Acceder al observer
observer.takeRecords() // Ver todos los elementos y su estado
```

### Inspeccionar intersectionRatio

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const visibility = Math.round(entry.intersectionRatio * 100)
    console.log(`${entry.target.id}: ${visibility}%`)
  })
}, { threshold: [0, 0.25, 0.5, 0.75, 1] })
```

## Limitaciones Conocidas

### 1. No funciona con elementos ocultos

```javascript
// ❌ Elementos display:none nunca se intersectan
if (entry.isIntersecting) {
  // Esto nunca se dispara si el elemento está oculto
}
```

### 2. No detecta cambios de tamaño

```javascript
// Cambiar tamaño del elemento no dispara callback
element.style.height = '500px' // No dispara
// Solución: usar ResizeObserver en conjunto
```

### 3. Performance con muchos elementos

```javascript
// ❌ 10,000+ elementos = problemas
querySelectorAll('*').forEach(el => observer.observe(el))

// ✅ Virtualización o paginación
virtualScrollContainer.observe() // Solo observar visibles
```

## Comparación con Alternativas

| Método | Performance | Precisión | Complejidad |
|--------|---|---|---|
| Scroll listener | ❌ Mala | Baja | Baja |
| getBoundingClientRect | ⚠️ Media | Alta | Media |
| **Intersection Observer** | ✅ Excelente | Alta | Baja |

## Polyfill para IE 11

```javascript
// Si necesitas soportar IE 11
import 'intersection-observer'

const observer = new IntersectionObserver(callback, options)
```

## Ejemplos en Frameworks

### React

```javascript
import { useEffect, useRef } from 'react'

function LazyImage({ src, alt }) {
  const imgRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && imgRef.current) {
        imgRef.current.src = src
        observer.unobserve(imgRef.current)
      }
    })

    if (imgRef.current) observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [src])

  return <img ref={imgRef} alt={alt} />
}
```

### Vue

```vue
<template>
  <img ref="image" :alt="alt" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const image = ref(null)
let observer

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      image.value.src = props.src
      observer.unobserve(image.value)
    }
  })
  observer.observe(image.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>
```

## Checklist de Implementación

- ✅ Usar `threshold` apropiado (generalmente 0.1 o 0.5)
- ✅ Usar `rootMargin` para pre-cargar
- ✅ Reutilizar un observer para múltiples elementos
- ✅ Hacer `unobserve()` cuando ya no necesites
- ✅ Llamar `disconnect()` al destruir el componente
- ✅ Validar `entry.target` en callback
- ✅ Considerar fallback para IE 11
- ✅ Testar con DevTools
- ✅ Medir performance con Chrome DevTools

## Conclusión

**Intersection Observer** es la solución moderna y eficiente para:
- 🖼️ Lazy loading de imágenes
- ♾️ Infinite scroll
- ✨ Animaciones al scroll
- 📊 Analytics y tracking
- 🎯 Optimización de rendimiento

Es simple, potente y ampliamente soportado. **Úsalo hoy** en lugar de listeners de scroll complejos.

---

## Recursos

- [MDN: Intersection Observer API](https://developer.mozilla.org/es/docs/Web/API/Intersection_Observer_API)
- [W3C Specification](https://www.w3.org/TR/intersection-observer/)
- [Can I Use](https://caniuse.com/intersectionobserver)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/)

## Posts Relacionados

- Infinite Scroll: Implementación Profesional con React
- Optimización de Imágenes en Next.js
- Web Vitals y Rendimiento
