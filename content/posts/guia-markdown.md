---
title: "Guía Completa de Markdown para el Blog"
date: "2024-01-20"
excerpt: "Aprende todas las características de Markdown soportadas en este blog con ejemplos prácticos y casos de uso reales."
category: "Tutoriales"
tags: ["markdown", "guia", "documentacion"]
author: "Tu Nombre"
image: "/placeholder.svg?height=400&width=800"
---

# Guía Completa de Markdown

Esta guía te muestra todas las características de **Markdown** soportadas en este blog.

## Texto Básico

Puedes escribir texto normal, usar **negrita**, *cursiva*, o ***ambos***.

También puedes usar ~~texto tachado~~ (si tu procesador lo soporta).

## Enlaces e Imágenes

Los [enlaces se crean así](https://nextjs.org) y son muy fáciles de usar.

Las imágenes funcionan de manera similar:

![Ejemplo de imagen](/placeholder.svg?height=300&width=600&query=codigo)

## Bloques de Código

### Código en línea

Usa comillas invertidas para `código en línea` como esta función: `useState()`.

### Bloques de código

Para bloques más grandes, usa tres comillas invertidas:

```javascript
function saludar(nombre) {
  console.log(`Hola, ${nombre}!`)
  return true
}

saludar("Mundo")
```

### Diferentes lenguajes

#### TypeScript

```typescript
interface Usuario {
  id: number
  nombre: string
  email: string
}

const usuario: Usuario = {
  id: 1,
  nombre: "Juan",
  email: "juan@ejemplo.com"
}
```

#### Python

```python
def calcular_factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * calcular_factorial(n - 1)

print(calcular_factorial(5))  # 120
```

#### CSS

```css
.contenedor {
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, #667eea, #764ba2);
}
```

## Listas

### Listas desordenadas

- Primer elemento
- Segundo elemento
- Tercer elemento
  - Sub-elemento 1
  - Sub-elemento 2

### Listas ordenadas

1. Primero haz esto
2. Luego haz esto
3. Finalmente haz esto

## Citas

> "La simplicidad es la máxima sofisticación."
> 
> — Leonardo da Vinci

Las citas pueden tener múltiples párrafos:

> Este es el primer párrafo de la cita.
>
> Y este es el segundo párrafo.

## Tablas

| Característica | Soporte | Notas |
|----------------|---------|-------|
| Títulos | ✅ | H1-H6 |
| Código | ✅ | Con syntax highlighting |
| Imágenes | ✅ | Responsive |
| Tablas | ✅ | GFM |

## Separadores

Puedes usar separadores para dividir secciones:

---

## Combinaciones Avanzadas

Puedes combinar diferentes elementos:

### Lista con código

1. Primero instala las dependencias:
   ```bash
   npm install next react react-dom
   ```

2. Luego crea tu aplicación:
   ```bash
   npx create-next-app@latest
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Cita con código

> "Usa siempre `const` en lugar de `var` en JavaScript moderno."

## Consejos y Mejores Prácticas

1. **Usa títulos jerárquicos**: Siempre empieza con H1 y sigue el orden
2. **Formatea el código**: El syntax highlighting hace tu código más legible
3. **Optimiza imágenes**: Usa imágenes optimizadas para web
4. **Escribe enlaces descriptivos**: Evita "click aquí"

## Conclusión

Con Markdown puedes crear contenido rico y bien formateado de manera simple. Este blog soporta todas las características estándar de Markdown más algunas extensiones de GFM (GitHub Flavored Markdown).

¡Feliz escritura!
